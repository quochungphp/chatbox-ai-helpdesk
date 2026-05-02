import type { CorsOptions } from "cors";
import { injectable } from "inversify";
import { getServiceConfig } from "@ai-service-desk/shared/config";
import { createLogger } from "@ai-service-desk/shared/logger";

@injectable()
export class AuditConfigService {
  private readonly serviceConfig = getServiceConfig("audit-service", 4008);

  readonly logger = createLogger(this.serviceConfig.serviceName);

  get port(): number {
    return this.serviceConfig.port;
  }

  get nodeEnv(): string {
    return this.serviceConfig.nodeEnv;
  }

  get databaseUrl(): string {
    return process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:15432/audit_db";
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
