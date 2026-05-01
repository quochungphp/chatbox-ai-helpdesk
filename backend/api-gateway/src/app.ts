import cors from "cors";
import express from "express";
import helmet from "helmet";
import type { Express } from "express";
import { health, success } from "@ai-service-desk/shared/utils";
import { createGatewayConfig } from "./config/gateway.config.js";
import { correlationIdMiddleware } from "./middlewares/correlation-id.middleware.js";
import { createRateLimitMiddleware } from "./middlewares/rate-limit.middleware.js";
import { requestLoggerMiddleware } from "./middlewares/request-logger.middleware.js";
import { registerProxyRoutes } from "./routes/proxy.routes.js";

export function createApp(config = createGatewayConfig()): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(cors(config.cors));
  app.use(correlationIdMiddleware);
  app.use(requestLoggerMiddleware(config.logger));
  app.use(createRateLimitMiddleware(config.rateLimit, config.logger));

  app.get("/health", (_req, res) => res.json(health(config.serviceName)));
  app.get("/ready", (_req, res) => res.json(health(config.serviceName)));
  app.get("/api", (_req, res) =>
    res.json(
      success({
        service: config.serviceName,
        routes: config.routes.map((route) => ({
          path: route.publicPath,
          target: route.targetName
        }))
      })
    )
  );

  registerProxyRoutes(app, config);

  return app;
}
