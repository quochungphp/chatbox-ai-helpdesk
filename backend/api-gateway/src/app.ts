import cors from "cors";
import express from "express";
import type { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import { createLogger } from "@ai-service-desk/shared/logger";
import { CORRELATION_ID_HEADER, createId, health, success } from "@ai-service-desk/shared/utils";

const serviceName = "api-gateway";
const logger = createLogger(serviceName);

const targets = {
  auth: process.env.AUTH_SERVICE_URL ?? "http://localhost:4001",
  banking: process.env.BANKING_SERVICE_URL ?? "http://localhost:4002",
  chatbot: process.env.CHATBOT_SERVICE_URL ?? "http://localhost:4003",
  rag: process.env.RAG_SERVICE_URL ?? "http://localhost:4005",
  ticket: process.env.TICKET_SERVICE_URL ?? "http://localhost:4006",
  audit: process.env.AUDIT_SERVICE_URL ?? "http://localhost:4008"
};

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(morgan("combined"));

  app.use((req, res, next) => {
    const correlationId = req.header(CORRELATION_ID_HEADER) ?? createId("corr");
    req.headers[CORRELATION_ID_HEADER] = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    next();
  });

  app.get("/health", (_req, res) => res.json(health(serviceName)));
  app.get("/ready", (_req, res) => res.json(health(serviceName)));
  app.get("/api", (_req, res) =>
    res.json(
      success({
        service: serviceName,
        routes: ["/api/auth", "/api/chat", "/api/tickets", "/api/banking", "/api/admin", "/api/kb"]
      })
    )
  );

  app.use("/api/auth", proxy("/api/auth", targets.auth));
  app.use("/api/chat", proxy("/api/chat", targets.chatbot));
  app.use("/api/tickets", proxy("/api/tickets", targets.ticket));
  app.use("/api/banking", proxy("/api/banking", targets.banking));
  app.use("/api/admin", proxy("/api/admin", targets.audit));
  app.use("/api/kb", proxy("/api/kb", targets.rag));

  return app;
}

function proxy(path: string, target: string) {
  logger.info("proxy_route_registered", { path, target });

  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (upstreamPath) => `${path}${upstreamPath}`
  });
}
