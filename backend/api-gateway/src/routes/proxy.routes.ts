import type { Express } from "express";
import type { GatewayConfig } from "../config/gateway.config.js";
import { createServiceProxy } from "../proxy/create-service-proxy.js";

export function registerProxyRoutes(app: Express, config: GatewayConfig): void {
  for (const route of config.routes) {
    config.logger.info("proxy_route_registered", {
      publicPath: route.publicPath,
      targetName: route.targetName,
      targetUrl: route.targetUrl,
      upstreamPath: route.upstreamPath
    });

    app.use(route.publicPath, createServiceProxy(route));
  }
}
