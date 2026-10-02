import { z } from "zod";

import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../lib/http.js";
import { logger } from "../../lib/logger.js";
import { getAiAccess } from "./access.js";
import { createFakeProvider } from "./providers/fake.provider.js";
import { createGeminiProvider } from "./providers/gemini.provider.js";
import { AiProviderError, type AiFeature, type AiMessage, type AiProvider } from "./types.js";

/**
 * The single entry point for AI calls. Every call:
 *   1. checks the user's trial + daily quota (access.ts)
 *   2. tries the main model, retries once if it's overloaded, then the fallback model
 *   3. for JSON calls, validates the reply against a zod schema (one extra try if invalid)
 *   4. records every attempt in ai_usage, success or not
 * Grounding rule (PRD-01 §3.8): callers put the student's real data in the
 * prompt and must never ask the model to invent skills or scores.
 */

export const provider: AiProvider =
  env.AI_PROVIDER === "fake" ? createFakeProvider() : createGeminiProvider();

export interface AiRequest {
  userId: string;
  feature: AiFeature;
  system: string;
  messages: AiMessage[];
  temperature?: number;
  maxOutputTokens?: number;
  thinking?: boolean;
}

export interface AiResult<T> {
  data: T;
  model: string;
  usage: { inputTokens: number; outputTokens: number };
}

const RETRY_DELAY_MS = env.NODE_ENV === "test" ? 0 : 700;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Free-text reply (chat). */
export function generateText(request: AiRequest): Promise<AiResult<string>> {
  return run(request, (text) => text.trim());
}

/** Structured reply, validated against `schema`. The schema is also sent to the model. */
export function generateJson<T extends z.ZodType>(
  request: AiRequest,
  schema: T,
): Promise<AiResult<z.infer<T>>> {
  // Gemini takes plain JSON Schema; the "$schema" dialect marker isn't needed.
  const jsonSchema = { ...(z.toJSONSchema(schema, { io: "output" }) as Record<string, unknown>) };
  delete jsonSchema.$schema;
  return run(
    request,
    (text) => {
      const parsed = schema.safeParse(safeJsonParse(text));
      if (!parsed.success)
        throw new AiProviderError("Reply didn't match the schema", "AI_BAD_RESPONSE", true);
      return parsed.data;
    },
    jsonSchema,
  );
}

async function run<T>(
  request: AiRequest,
  parse: (text: string) => T,
  jsonSchema?: Record<string, unknown>,
): Promise<AiResult<T>> {
  if (!provider.configured) {
    throw new AppError(503, "AI_NOT_CONFIGURED", "AI features aren't available right now.");
  }

  const user = await prisma.user.findUnique({
    where: { id: request.userId },
    select: { createdAt: true },
  });
  if (!user) throw new AppError(401, "UNAUTHORIZED", "Sign in to continue.");
  const access = await getAiAccess(request.userId, user.createdAt);
  if (access.reason === "AI_TRIAL_ENDED") {
    throw new AppError(403, "AI_TRIAL_ENDED", "Your AI free trial has ended.");
  }
  if (access.reason === "AI_DAILY_LIMIT") {
    throw new AppError(
      429,
      "AI_DAILY_LIMIT",
      "You've reached today's AI limit. It resets at midnight.",
    );
  }

  // Main model twice (overload is often momentary), then each fallback once.
  const [main, ...fallbacks] = provider.models;
  const attempts = [main!, main!, ...fallbacks];
  const deadline = AbortSignal.timeout(env.AI_TIMEOUT_MS);
  let lastError: AiProviderError | null = null;

  for (const [index, model] of attempts.entries()) {
    if (index > 0 && attempts[index - 1] === model) await sleep(RETRY_DELAY_MS);
    if (deadline.aborted) break;

    const started = Date.now();
    try {
      const reply = await provider.generate({
        model,
        system: request.system,
        messages: request.messages,
        jsonSchema,
        temperature: request.temperature,
        maxOutputTokens: request.maxOutputTokens,
        thinking: request.thinking,
        signal: deadline,
      });
      const data = parse(reply.text);
      await recordUsage(request, model, Date.now() - started, reply, null);
      return {
        data,
        model,
        usage: { inputTokens: reply.inputTokens, outputTokens: reply.outputTokens },
      };
    } catch (error) {
      const failure =
        error instanceof AiProviderError
          ? error
          : new AiProviderError(String(error), "AI_UNKNOWN_ERROR", false);
      await recordUsage(request, model, Date.now() - started, null, failure.code);
      logger.warn(
        { feature: request.feature, model, code: failure.code, err: failure.message },
        "AI attempt failed",
      );
      lastError = failure;
      if (!failure.retryable) break;
    }
  }

  if (lastError?.code === "AI_BAD_RESPONSE") {
    throw new AppError(502, "AI_BAD_RESPONSE", "The AI gave an unusable answer. Please try again.");
  }
  throw new AppError(
    503,
    "AI_UNAVAILABLE",
    "The AI is busy right now. Please try again in a moment.",
  );
}

function safeJsonParse(text: string): unknown {
  try {
    // Some models wrap JSON in ```json fences even in JSON mode.
    return JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
  } catch {
    return undefined;
  }
}

async function recordUsage(
  request: AiRequest,
  model: string,
  latencyMs: number,
  reply: { inputTokens: number; outputTokens: number } | null,
  errorCode: string | null,
) {
  try {
    await prisma.aiUsage.create({
      data: {
        userId: request.userId,
        feature: request.feature,
        provider: provider.name,
        model,
        inputTokens: reply?.inputTokens ?? 0,
        outputTokens: reply?.outputTokens ?? 0,
        latencyMs,
        success: errorCode === null,
        errorCode,
      },
    });
  } catch (error) {
    // Metering must never break the feature the student is using.
    logger.error({ err: error }, "Failed to record AI usage");
  }
}
