import type { Request, RequestHandler, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { CORRELATION_ID_HEADER, failure } from "@ai-service-desk/shared/utils";
import type { GatewayRouteConfig } from "../config/gateway.config.js";

export function createServiceProxy(route: GatewayRouteConfig): RequestHandler {
  return createProxyMiddleware<Request, Response>({
    target: route.targetUrl,
    changeOrigin: true,
    proxyTimeout: route.timeoutMs,
    timeout: route.timeoutMs,
    pathRewrite: (path) => `${route.upstreamPath}${path}`,
    on: {
      proxyReq: (proxyReq, req) => {
        const correlationId = req.header(CORRELATION_ID_HEADER);

        if (correlationId) {
          proxyReq.setHeader(CORRELATION_ID_HEADER, correlationId);
        }

        proxyReq.setHeader("x-forwarded-service", "api-gateway");
      },
      error: (_error, _req, res) => {
        if ("status" in res && !res.headersSent) {
          res.status(502).json(failure("UPSTREAM_UNAVAILABLE", `${route.targetName} is unavailable`));
        }
      }
    }
  });
}
