const RETRYABLE_STATUS = new Set([408, 409, 429, 500, 502, 503, 504]);

export function isRetryableError(error: unknown) {
  const status = (error as { status?: unknown })?.status;

  if (typeof status === "number") {
    return RETRYABLE_STATUS.has(status);
  }

  // No HTTP status: network failure, timeout, aborted socket — worth retrying.
  return true;
}

export async function withRetries<T>(
  task: () => Promise<T>,
  options: { attempts?: number; baseDelayMs?: number } = {},
): Promise<T> {
  const attempts = options.attempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 500;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await task();
    } catch (error) {
      lastError = error;

      if (attempt === attempts || !isRetryableError(error)) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * attempt));
    }
  }

  throw lastError;
}
