import cors from "cors";
import express from "express";
import helmet from "helmet";
import { InversifyExpressServer } from "inversify-express-utils";
import type { Application, NextFunction, Request, Response } from "express";
import type { Container } from "inversify";
import { health } from "@ai-service-desk/shared/utils";
import { InversifyContainer } from "./bootstrap-container.js";
import { TYPES } from "./bootstrap-type.js";
import { ErrorHandlerMiddleware } from "./middlewares/error-handler.middleware.js";
import { LoggerMiddleware } from "./middlewares/logger.middleware.js";
import { AuditConfigService } from "./services/config.service.js";

const serviceName = "audit-service";

export class BootstrapApp {
  private readonly container: Container;
  private readonly configService: AuditConfigService;
  private app: Application | null = null;

  constructor(container = new InversifyContainer().getContainer()) {
    this.container = container;
    this.configService = this.container.get<AuditConfigService>(TYPES.ConfigService);
  }

  async setup(): Promise<BootstrapApp> {
    const server = new InversifyExpressServer(this.container);

    server.setConfig((app) => {
      const loggerMiddleware = this.container.get<LoggerMiddleware>(TYPES.LoggerMiddleware);

      app.use(helmet());
      app.use(cors(this.configService.corsConfig));
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      app.use((req, res, next) => loggerMiddleware.handler(req, res, next));

      app.get("/health", (_req, res) => res.json(health(serviceName)));
      app.get("/ready", (_req, res) => res.json(health(serviceName)));
    });

    server.setErrorConfig((app) => {
      const errorHandler = this.container.get<ErrorHandlerMiddleware>(TYPES.ErrorHandlerMiddleware);
      app.use((error: Error, req: Request, res: Response, next: NextFunction) => errorHandler.handle(error, req, res, next));
    });

    this.app = server.build();
    return this;
  }

  init(): void {
    this.getServer().listen(this.configService.port, () => {
      this.configService.logger.info("service_started", {
        port: this.configService.port,
        nodeEnv: this.configService.nodeEnv
      });
    });
  }

  getServer(): Application {
    if (!this.app) {
      throw new Error("Audit service has not been set up yet");
    }

    return this.app;
  }
}
