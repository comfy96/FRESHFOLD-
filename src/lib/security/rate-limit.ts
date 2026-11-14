export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  key: string;
}

interface BucketEntry {
  count: number;
  resetAt: number;
}

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5;

const globalBuckets = globalThis as unknown as {
  __freshfoldRateLimits?: Map<string, BucketEntry>;
};

function getStore(): Map<string, BucketEntry> {
  if (!globalBuckets.__freshfoldRateLimits) {
    globalBuckets.__freshfoldRateLimits = new Map<string, BucketEntry>();
  }
  return globalBuckets.__freshfoldRateLimits;
}

/** Extract caller IP from proxy headers first, falling back to local loopback in single-host dev. */
export function getClientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return '127.0.0.1';
}

/**
 * Enforce an in-memory fixed-window rate limit (5 attempts per 15 minutes per route + IP).
 */
export function checkRateLimit(routeKey: string, clientIp: string): RateLimitResult {
  const store = getStore();
  const key = `${routeKey}:ip:${clientIp}`;
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return {
      allowed: true,
      limit: RATE_LIMIT_MAX_ATTEMPTS,
      remaining: RATE_LIMIT_MAX_ATTEMPTS - 1,
      retryAfterSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
      key,
    };
  }

  existing.count += 1;
  store.set(key, existing);
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  if (existing.count > RATE_LIMIT_MAX_ATTEMPTS) {
    return {
      allowed: false,
      limit: RATE_LIMIT_MAX_ATTEMPTS,
      remaining: 0,
      retryAfterSeconds,
      key,
    };
  }

  return {
    allowed: true,
    limit: RATE_LIMIT_MAX_ATTEMPTS,
    remaining: RATE_LIMIT_MAX_ATTEMPTS - existing.count,
    retryAfterSeconds,
    key,
  };
}
