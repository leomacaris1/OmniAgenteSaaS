// In-memory sliding-window rate limiter. Good enough for the single-process
// private MVP; replace with a shared store (Redis/Postgres) before running
// multiple instances, since each process keeps its own counters.

export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

const attemptLog = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  maxAttempts = LOGIN_MAX_ATTEMPTS,
  windowMs = LOGIN_WINDOW_MS,
  now = Date.now(),
): RateLimitResult {
  const cutoff = now - windowMs;
  const attempts = (attemptLog.get(key) ?? []).filter((timestamp) => timestamp > cutoff);

  if (attempts.length >= maxAttempts) {
    attemptLog.set(key, attempts);
    const oldest = attempts[0];
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  attempts.push(now);
  attemptLog.set(key, attempts);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetRateLimit(key: string) {
  attemptLog.delete(key);
}

export function clearAllRateLimits() {
  attemptLog.clear();
}
