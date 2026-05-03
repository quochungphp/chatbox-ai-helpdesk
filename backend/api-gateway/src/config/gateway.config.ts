import type { CorsOptions } from "cors";
import { getServiceConfig } from "@ai-service-desk/shared/config";
import { createLogger } from "@ai-service-desk/shared/logger";

export type GatewayRouteConfig = {
  publicPath: string;
  targetName: string;
  targetUrl: string;
  upstreamPath: string;
  timeoutMs: number;
};

export type GatewayConfig = ReturnType<typeof createGatewayConfig>;

/**
 * Builds runtime configuration for gateway routing, timeouts, CORS, logging,
 * and rate limiting from environment variables.
 */
export function createGatewayConfig() {
  const serviceConfig = getServiceConfig("api-gateway", 8080);
  const logger = createLogger(serviceConfig.serviceName);

  const defaultTimeoutMs = toNumber(process.env.UPSTREAM_TIMEOUT_MS, 10_000);

  return {
    ...serviceConfig,
    logger,
    cors: {
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-api-key", "x-correlation-id"]
    } satisfies CorsOptions,
    rateLimit: {
      keyPrefix: env("RATE_LIMIT_KEY_PREFIX", "api-gateway:rate-limit"),
      maxRequests: toNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 120),
      redisEnabled: toBoolean(process.env.RATE_LIMIT_REDIS_ENABLED, true),
      redisUrl: env("REDIS_URL", "redis://127.0.0.1:6379"),
      windowMs: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 60_000)
    },
    routes: [
      authRoute("/api/auth", "/api/auth", defaultTimeoutMs),
      authRoute("/api/users", "/api/users", defaultTimeoutMs),
      route("/api/chat", "chatbot-service", env("CHATBOT_SERVICE_URL", "http://localhost:4003"), "/api/chat", defaultTimeoutMs),
      route("/api/tickets", "ticket-service", env("TICKET_SERVICE_URL", "http://localhost:4006"), "/api/tickets", defaultTimeoutMs),
      route("/api/banking", "banking-service", env("BANKING_SERVICE_URL", "http://localhost:4002"), "/api/banking", defaultTimeoutMs),
      route("/api/admin", "audit-service", env("AUDIT_SERVICE_URL", "http://localhost:4008"), "/api/admin", defaultTimeoutMs),
      route("/api/notifications", "notification-service", env("NOTIFICATION_SERVICE_URL", "http://localhost:4007"), "/api/notifications", defaultTimeoutMs),
      route("/api/kb", "rag-service", env("RAG_SERVICE_URL", "http://localhost:4005"), "/api/kb", defaultTimeoutMs)
    ]
  };
}

/**
 * Creates an auth-service route while keeping the auth target URL centralized.
 */
function authRoute(publicPath: string, upstreamPath: string, timeoutMs: number): GatewayRouteConfig {
  return route(publicPath, "auth-service", env("AUTH_SERVICE_URL", "http://localhost:4001"), upstreamPath, timeoutMs);
}

/**
 * Normalizes a public gateway path into an upstream service route definition.
 */
function route(
  publicPath: string,
  targetName: string,
  targetUrl: string,
  upstreamPath: string,
  timeoutMs: number
): GatewayRouteConfig {
  return {
    publicPath,
    targetName,
    targetUrl,
    upstreamPath,
    timeoutMs
  };
}

/**
 * Reads an environment variable with a deterministic local fallback.
 */
function env(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

/**
 * Parses numeric environment values without letting bad input crash startup.
 */
function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

/**
 * Parses common truthy string values used by Docker Compose and shells.
 */
function toBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}
