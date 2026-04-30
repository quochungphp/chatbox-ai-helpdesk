import type { CorsOptions } from "cors";
import { injectable } from "inversify";
import { getServiceConfig } from "@ai-service-desk/shared/config";
import { createLogger } from "@ai-service-desk/shared/logger";

const defaultAuthConfig = {
  bcryptSaltRounds: 12,
  databaseUrl: "postgresql://postgres:postgres@127.0.0.1:15432/auth_db",
  jwtSecret: "local-dev-secret",
  serviceApiKey: "local-service-api-key"
} as const;

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

  get databaseUrl(): string {
    return process.env.DATABASE_URL ?? defaultAuthConfig.databaseUrl;
  }

  get jwtSecret(): string {
    return process.env.JWT_SECRET ?? defaultAuthConfig.jwtSecret;
  }

  get serviceApiKey(): string {
    return process.env.SERVICE_API_KEY ?? defaultAuthConfig.serviceApiKey;
  }

  get bcryptSaltRounds(): number {
    const value = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS ?? String(defaultAuthConfig.bcryptSaltRounds), 10);
    return Number.isNaN(value) ? defaultAuthConfig.bcryptSaltRounds : value;
  }

  get corsConfig(): CorsOptions {
    return {
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-api-key", "x-correlation-id"]
    };
  }
}
