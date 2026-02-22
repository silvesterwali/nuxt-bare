export interface RateLimitConfig {
  limit: number;
  windowMs: number;
  keyPrefix?: string;
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<void> {
  const storage = useStorage("rate-limits");
  const { limit, windowMs, keyPrefix = "rate-limit" } = config;

  const now = Date.now();
  const windowStart = Math.floor(now / windowMs);
  const storageKey = `${keyPrefix}:${key}:${windowStart}`;

  const attempts = ((await storage.getItem(storageKey)) as number) || 0;

  if (attempts >= limit) {
    throw createError({
      statusCode: 429,
      statusMessage: "Rate limit exceeded. Please try again later.",
    });
  }

  // Increment attempts and set TTL
  await storage.setItem(storageKey, attempts + 1);

  // Clean up old entries (optional, for memory driver)
  const ttlMs = windowMs + 60000; // Add 1 minute buffer
  setTimeout(async () => {
    await storage.removeItem(storageKey);
  }, ttlMs);
}

export const RATE_LIMITS = {
  LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  PASSWORD_RESET: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 requests per hour
  EMAIL_VERIFICATION: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 requests per hour
  REGISTRATION: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 registrations per hour per IP
} as const;

export function getClientIP(event: any): string {
  return (
    getHeader(event, "x-forwarded-for") ||
    getHeader(event, "x-real-ip") ||
    event.node?.req?.socket?.remoteAddress ||
    "unknown"
  );
}
