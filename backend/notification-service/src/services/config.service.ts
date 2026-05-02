import type { CorsOptions } from "cors";
import { injectable } from "inversify";
import { getServiceConfig } from "@ai-service-desk/shared/config";
import { createLogger } from "@ai-service-desk/shared/logger";

@injectable()
export class NotificationConfigService {
  private readonly serviceConfig = getServiceConfig("notification-service", 4007);

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
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-correlation-id"]
    };
  }
}
