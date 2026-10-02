import {
  AiProviderError,
  type AiProvider,
  type ProviderRequest,
  type ProviderResponse,
} from "../types.js";

/**
 * Scripted provider for tests (AI_PROVIDER=fake): never calls the network.
 * Queue replies with `fakeAi.reply()` / `fakeAi.fail()`; with an empty queue
 * it answers "fake reply". Every request is recorded in `fakeAi.calls`.
 */
type Scripted = { text: string } | { error: AiProviderError };

const queue: Scripted[] = [];
const calls: ProviderRequest[] = [];

export const fakeAi = {
  calls,
  reply(text: string | object) {
    queue.push({ text: typeof text === "string" ? text : JSON.stringify(text) });
  },
  fail(code = "AI_OVERLOADED", retryable = true) {
    queue.push({ error: new AiProviderError(`fake ${code}`, code, retryable) });
  },
  reset() {
    queue.length = 0;
    calls.length = 0;
  },
};

export function createFakeProvider(): AiProvider {
  return {
    name: "fake",
    models: ["fake-main", "fake-fallback"],
    configured: true,
    async generate(request: ProviderRequest): Promise<ProviderResponse> {
      calls.push(request);
      const next = queue.shift() ?? { text: "fake reply" };
      if ("error" in next) throw next.error;
      return { text: next.text, inputTokens: 10, outputTokens: 5 };
    },
  };
}
