import { createClient, type RedisClientType } from "redis";
import type { Logger } from "@ai-service-desk/shared/logger";
import type { RedisClientConfig } from "./redis.type.js";

export class RedisClient {
  private readonly client: RedisClientType;
  private connectPromise: Promise<void> | null = null;

  constructor(
    private readonly config: RedisClientConfig,
    private readonly logger: Logger
  ) {
    this.client = createClient({
      socket: {
        reconnectStrategy: false
      },
      url: config.url
    });

    this.client.on("error", (error) => {
      this.logger.warn("redis_client_error", {
        error: error instanceof Error ? error.message : String(error)
      });
    });
  }

  async connect(): Promise<RedisClientType> {
    if (this.client.isOpen) {
      return this.client;
    }

    this.connectPromise ??= this.client.connect().then(() => {
      this.logger.info("redis_connected", {
        redisUrl: redactRedisUrl(this.config.url)
      });
    });

    try {
      await this.connectPromise;
      return this.client;
    } catch (error) {
      this.connectPromise = null;
      throw error;
    }
  }
}

function redactRedisUrl(redisUrl: string): string {
  try {
    const url = new URL(redisUrl);

    if (url.password) {
      url.password = "****";
    }

    return url.toString();
  } catch {
    return "invalid-redis-url";
  }
}
