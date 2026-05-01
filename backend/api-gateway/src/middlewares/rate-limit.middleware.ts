import type { NextFunction, Request, Response } from "express";
import type { Logger } from "@ai-service-desk/shared/logger";
import { failure } from "@ai-service-desk/shared/utils";
import { RedisClient } from "../infrastructure/redis/redis.client.js";
import { RedisService } from "../infrastructure/redis/redis.service.js";
import type { RateLimitCounterResult } from "../infrastructure/redis/redis.type.js";

export type RateLimitConfig = {
  keyPrefix: string;
  maxRequests: number;
  redisEnabled: boolean;
  redisUrl: string;
  windowMs: number;
};

export type RateLimitResult = RateLimitCounterResult;

type Bucket = {
  count: number;
  resetAt: number;
};

/**
 * Creates API Gateway rate limiting middleware. Redis is used when available;
 * an in-memory fallback keeps local development and degraded mode usable.
 */
export function createRateLimitMiddleware(config: RateLimitConfig, logger: Logger) {
  const fallbackStore = new MemoryRateLimitStore(config);
  const redisService = config.redisEnabled ? new RedisService(new RedisClient({ url: config.redisUrl }, logger)) : null;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (isBypassedPath(req.path)) {
      next();
      return;
    }

    const key = `${config.keyPrefix}:${clientKey(req)}`;
    const result = await consumeRateLimit(key, config, fallbackStore, redisService, logger);

    res.setHeader("X-RateLimit-Limit", config.maxRequests);
    res.setHeader("X-RateLimit-Remaining", result.remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(result.resetAt / 1000));

    if (result.allowed) {
      next();
      return;
    }

    res.setHeader("Retry-After", result.retryAfterSeconds);
    res.status(429).json(failure("RATE_LIMITED", "Too many requests"));
  };
}

/**
 * Consumes one request from Redis first, then falls back to memory on failures.
 */
async function consumeRateLimit(
  key: string,
  config: RateLimitConfig,
  fallbackStore: MemoryRateLimitStore,
  redisService: RedisService | null,
  logger: Logger
): Promise<RateLimitResult> {
  if (!redisService) {
    return fallbackStore.consume(key);
  }

  try {
    return await redisService.consumeRateLimit({
      key,
      limit: config.maxRequests,
      windowMs: config.windowMs
    });
  } catch (error) {
    logger.warn("rate_limit_redis_failed_using_memory_fallback", {
      error: error instanceof Error ? error.message : String(error)
    });
    return fallbackStore.consume(key);
  }
}

/**
 * Per-process fixed-window limiter used only when Redis is disabled/unavailable.
 */
class MemoryRateLimitStore {
  private readonly buckets = new Map<string, Bucket>();

  constructor(private readonly config: RateLimitConfig) {}

  /**
   * Increments the request bucket and calculates limit headers.
   */
  consume(key: string): RateLimitResult {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      const resetAt = now + this.config.windowMs;
      this.buckets.set(key, { count: 1, resetAt });
      return this.result(1, resetAt, now);
    }

    bucket.count += 1;
    return this.result(bucket.count, bucket.resetAt, now);
  }

  /**
   * Converts a bucket count into the common rate limit result contract.
   */
  private result(count: number, resetAt: number, now: number): RateLimitResult {
    return {
      allowed: count <= this.config.maxRequests,
      remaining: Math.max(this.config.maxRequests - count, 0),
      resetAt,
      retryAfterSeconds: Math.max(Math.ceil((resetAt - now) / 1000), 1)
    };
  }
}

/**
 * Keeps health checks out of limiter accounting.
 */
function isBypassedPath(path: string): boolean {
  return path === "/health" || path === "/ready";
}

/**
 * Chooses the best client identity for rate limiting behind proxies.
 */
function clientKey(req: Request): string {
  const forwardedFor = req.header("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || req.ip || req.socket.remoteAddress || "unknown";
}
