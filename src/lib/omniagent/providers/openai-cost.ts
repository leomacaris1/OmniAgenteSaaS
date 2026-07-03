// Approximate defaults for the recommended model (gpt-5.4-mini). Override with
// env vars when pricing changes or a different model is configured — the
// estimate is informational, never a billing source of truth.
export const DEFAULT_INPUT_PRICE_PER_1M = 0.25;
export const DEFAULT_OUTPUT_PRICE_PER_1M = 2;

function parsePrice(raw: string | undefined, fallback: number) {
  const parsed = Number.parseFloat(raw ?? "");
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function estimateCostUsd(
  inputTokens?: number,
  outputTokens?: number,
): number | undefined {
  if (inputTokens === undefined && outputTokens === undefined) {
    return undefined;
  }

  const inputPrice = parsePrice(process.env.OPENAI_PRICE_INPUT_PER_1M, DEFAULT_INPUT_PRICE_PER_1M);
  const outputPrice = parsePrice(process.env.OPENAI_PRICE_OUTPUT_PER_1M, DEFAULT_OUTPUT_PRICE_PER_1M);
  const cost = ((inputTokens ?? 0) * inputPrice + (outputTokens ?? 0) * outputPrice) / 1_000_000;

  return Math.round(cost * 1_000_000) / 1_000_000;
}
