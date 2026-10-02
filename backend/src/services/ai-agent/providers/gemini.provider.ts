import { ApiError, GoogleGenAI } from "@google/genai";

import { env } from "../../../config/env.js";
import {
  AiProviderError,
  type AiProvider,
  type ProviderRequest,
  type ProviderResponse,
} from "../types.js";

/** Google Gemini via the official @google/genai SDK (free tier to start). */
export function createGeminiProvider(): AiProvider {
  const client = env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : null;

  return {
    name: "gemini",
    models: [env.GEMINI_MODEL, env.GEMINI_FALLBACK_MODEL].filter(Boolean),
    configured: client !== null,

    async generate(request: ProviderRequest): Promise<ProviderResponse> {
      if (!client)
        throw new AiProviderError("GEMINI_API_KEY is not set", "AI_NOT_CONFIGURED", false);

      try {
        const response = await client.models.generateContent({
          model: request.model,
          contents: request.messages.map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }],
          })),
          config: {
            systemInstruction: request.system,
            temperature: request.temperature,
            maxOutputTokens: request.maxOutputTokens,
            thinkingConfig: { thinkingBudget: request.thinking ? -1 : 0 },
            abortSignal: request.signal,
            ...(request.jsonSchema
              ? { responseMimeType: "application/json", responseJsonSchema: request.jsonSchema }
              : {}),
          },
        });

        const text = response.text ?? "";
        if (!text.trim()) {
          // Empty replies usually mean the safety filter or the token limit cut the answer.
          const reason = response.candidates?.[0]?.finishReason ?? "unknown";
          throw new AiProviderError(
            `Empty reply (finishReason: ${reason})`,
            "AI_EMPTY_REPLY",
            true,
          );
        }

        const usage = response.usageMetadata;
        return {
          text,
          inputTokens: usage?.promptTokenCount ?? 0,
          outputTokens: (usage?.candidatesTokenCount ?? 0) + (usage?.thoughtsTokenCount ?? 0),
        };
      } catch (error) {
        throw toProviderError(error, request.signal);
      }
    },
  };
}

function toProviderError(error: unknown, signal: AbortSignal): AiProviderError {
  if (error instanceof AiProviderError) return error;
  if (signal.aborted) return new AiProviderError("AI request timed out", "AI_TIMEOUT", true);
  if (error instanceof ApiError) {
    // 429 rate limit, 500/503/504 overload — another try or the fallback model may work.
    const retryable = error.status === 429 || error.status >= 500;
    const code =
      error.status === 429
        ? "AI_RATE_LIMITED"
        : error.status >= 500
          ? "AI_OVERLOADED"
          : `AI_HTTP_${error.status}`;
    return new AiProviderError(
      error.message,
      code,
      retryable,
      error.status === 429 ? retryDelayMs(error.message) : undefined,
    );
  }
  return new AiProviderError(String(error), "AI_NETWORK_ERROR", true);
}

/**
 * Gemini's 429 body says how long to wait, e.g. `"retryDelay":"22951s"` once
 * the free tier's daily quota is used up, or a few seconds for a per-minute limit.
 */
function retryDelayMs(message: string): number | undefined {
  const match = /"retryDelay":\s*"(\d+(?:\.\d+)?)s"/.exec(message);
  return match ? Math.round(Number(match[1]) * 1000) : undefined;
}
