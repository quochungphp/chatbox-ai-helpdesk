export type RedisClientConfig = {
  url: string;
};

export type RateLimitCounterInput = {
  key: string;
  limit: number;
  windowMs: number;
};

export type RateLimitCounterResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};
