import type { CorsOptions } from "cors";
import { injectable } from "inversify";
import { getServiceConfig } from "@ai-service-desk/shared/config";
import { createLogger } from "@ai-service-desk/shared/logger";

@injectable()
export class AuthConfigService {
  private readonly serviceConfig = getServiceConfig("auth-service", 4001);

  readonly logger = createLogger(this.serviceConfig.serviceName);

  get port(): number {
    return this.serviceConfig.port;
  }

  get nodeEnv(): string {
    return this.serviceConfig.nodeEnv;
  }

  get jwtSecret(): string {
    return process.env.JWT_SECRET ?? "local-dev-secret";
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

