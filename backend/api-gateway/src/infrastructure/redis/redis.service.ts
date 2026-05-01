import { RedisClient } from "./redis.client.js";
import type { RateLimitCounterInput, RateLimitCounterResult } from "./redis.type.js";

/**
 * Redis-backed infrastructure operations used by gateway middleware.
 */
export class RedisService {
  constructor(private readonly redisClient: RedisClient) {}

  /**
   * Applies a fixed-window rate limit with INCR + PEXPIRE so all gateway
   * instances share the same counter in production.
   */
  async consumeRateLimit(input: RateLimitCounterInput): Promise<RateLimitCounterResult> {
    const client = await this.redisClient.connect();
    const count = await client.incr(input.key);

    if (count === 1) {
      await client.pExpire(input.key, input.windowMs);
    }

    const ttlMs = await client.pTTL(input.key);
    const effectiveTtlMs = ttlMs > 0 ? ttlMs : input.windowMs;
    const resetAt = Date.now() + effectiveTtlMs;

    return {
      allowed: count <= input.limit,
      remaining: Math.max(input.limit - count, 0),
      resetAt,
      retryAfterSeconds: Math.max(Math.ceil(effectiveTtlMs / 1000), 1)
    };
  }
}
