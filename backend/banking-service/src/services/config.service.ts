import type { CorsOptions } from "cors";
import { injectable } from "inversify";
import { getServiceConfig } from "@ai-service-desk/shared/config";
import { createLogger } from "@ai-service-desk/shared/logger";

/**
 * Runtime configuration for banking-service.
 */
@injectable()
export class BankingConfigService {
  private readonly serviceConfig = getServiceConfig("banking-service", 4002);

  readonly logger = createLogger(this.serviceConfig.serviceName);

  get port(): number {
    return this.serviceConfig.port;
  }

  get nodeEnv(): string {
    return this.serviceConfig.nodeEnv;
  }

  get corsConfig(): CorsOptions {
    return {
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-correlation-id"]
    };
  }
}
