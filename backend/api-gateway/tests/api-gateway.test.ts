import express from "express";
import request from "supertest";
import type { Server } from "node:http";
import { randomUUID } from "node:crypto";
import { createApp } from "../src/app.js";
import { createGatewayConfig, type GatewayConfig } from "../src/config/gateway.config.js";

describe("API Gateway", () => {
  let authServer: Server;
  let authServiceUrl: string;

  beforeAll(async () => {
    const authApp = express();
    authApp.use(express.json());
    authApp.post("/api/users", (req, res) => {
      res.json({
        success: true,
        data: {
          receivedBy: "auth-service",
          body: req.body,
          correlationId: req.header("x-correlation-id")
        },
        error: null
      });
    });

    await new Promise<void>((resolve) => {
      authServer = authApp.listen(0, "127.0.0.1", resolve);
    });

    const address = authServer.address();
    const port = typeof address === "object" && address ? address.port : 0;
    authServiceUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      authServer.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("returns gateway health", async () => {
    const app = createApp(testConfig());

    await request(app)
      .get("/health")
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({
          service: "api-gateway",
          status: "ok"
        });
      });
  });

  it("returns configured route metadata", async () => {
    const app = createApp(testConfig());

    await request(app)
      .get("/api")
      .expect(200)
      .expect((response) => {
        expect(response.body.data.routes).toEqual(
          expect.arrayContaining([
            {
              path: "/api/auth",
              target: "auth-service"
            },
            {
              path: "/api/users",
              target: "auth-service"
            }
          ])
        );
      });
  });

  it("rate limits requests without requiring Redis", async () => {
    const config = testConfig({
      maxRequests: 2,
      redisEnabled: false,
      windowMs: 60_000
    });
    const app = createApp(config);

    await request(app).get("/api").expect(200);
    await request(app).get("/api").expect(200);

    await request(app)
      .get("/api")
      .expect(429)
      .expect((response) => {
        expect(response.body).toMatchObject({
          success: false,
          error: {
            code: "RATE_LIMITED"
          }
        });
      });
  });

  it("proxies user routes to auth-service and forwards correlation id", async () => {
    const app = createApp(testConfig());

    await request(app)
      .post("/api/users")
      .set("x-correlation-id", "corr_test")
      .send({
        email: "gateway-test@nab-demo.local"
      })
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({
          success: true,
          data: {
            receivedBy: "auth-service",
            correlationId: "corr_test",
            body: {
              email: "gateway-test@nab-demo.local"
            }
          }
        });
      });
  });

  function testConfig(rateLimit?: Partial<GatewayConfig["rateLimit"]>): GatewayConfig {
    const config = createGatewayConfig();

    return {
      ...config,
      logger: {
        info: () => undefined,
        warn: () => undefined,
        error: () => undefined
      },
      rateLimit: {
        ...config.rateLimit,
        keyPrefix: `api-gateway:test:${randomUUID()}`,
        redisEnabled: false,
        ...rateLimit
      },
      routes: config.routes.map((route) =>
        route.targetName === "auth-service"
          ? {
              ...route,
              targetUrl: authServiceUrl
            }
          : route
      )
    };
  }
});
