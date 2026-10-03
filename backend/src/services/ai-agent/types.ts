/**
 * Provider-agnostic contract for the AI layer. Features (onboarding,
 * assessment, next steps) only ever talk to `ai.service.ts`, which talks to an
 * `AiProvider` — so switching from Gemini to another vendor means adding one
 * provider file, not touching callers.
 */

/** What a call is for — recorded on every ai_usage row. */
export type AiFeature =
  | "onboarding"
  | "assessment"
  | "task_review"
  | "next_steps"
  | "coach"
  | "coach_nudge"
  | "smoke_test";

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ProviderRequest {
  model: string;
  system: string;
  messages: AiMessage[];
  /** JSON Schema the reply must follow; the provider returns raw JSON text. */
  jsonSchema?: Record<string, unknown>;
  temperature?: number;
  maxOutputTokens?: number;
  /** Lets the model reason before answering; slower and costs more tokens. */
  thinking?: boolean;
  signal: AbortSignal;
}

export interface ProviderResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

export interface AiProvider {
  readonly name: string;
  /** Models to try in order: the main one, then fallbacks. */
  readonly models: string[];
  readonly configured: boolean;
  generate(request: ProviderRequest): Promise<ProviderResponse>;
}

/**
 * A failed provider call. `retryable` covers overload/rate-limit/timeouts
 * (worth another try or the fallback model); anything else fails fast.
 */
export class AiProviderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean,
    /** For rate limits: how long the provider says to wait before using this model again. */
    public readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}
