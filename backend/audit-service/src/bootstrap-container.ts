import "reflect-metadata";
import { Container } from "inversify";
import "./controllers/audit.controller.js";
import { AuditController } from "./controllers/audit.controller.js";
import { ErrorHandlerMiddleware } from "./middlewares/error-handler.middleware.js";
import { LoggerMiddleware } from "./middlewares/logger.middleware.js";
import { AuditRepository } from "./repositories/audit.repository.js";
import { AuditService } from "./services/audit.service.js";
import { AuditConfigService } from "./services/config.service.js";
import { PrismaService } from "./services/prisma.service.js";
import { TYPES } from "./bootstrap-type.js";

type Dependency<T> = {
  type: symbol;
  target: new (...args: never[]) => T;
  singleton: boolean;
};

export class BaseInversifyContainer {
  protected readonly container: Container;

  constructor() {
    this.container = new Container({ defaultScope: "Transient" });
  }

  protected registerContainer(dependencies: Array<Dependency<unknown>>): void {
    for (const dependency of dependencies) {
      const binding = this.container.bind(dependency.type).to(dependency.target);

      if (dependency.singleton) {
        binding.inSingletonScope();
      }
    }
  }
}

export class InversifyContainer extends BaseInversifyContainer {
  constructor() {
    super();
    this.registerDependencies();
  }

  getContainer(): Container {
    return this.container;
  }

  private registerDependencies(): void {
    this.registerContainer([
      { type: TYPES.AuditController, target: AuditController, singleton: false },
      { type: TYPES.AuditRepository, target: AuditRepository, singleton: true },
      { type: TYPES.AuditService, target: AuditService, singleton: true },
      { type: TYPES.ConfigService, target: AuditConfigService, singleton: true },
      { type: TYPES.ErrorHandlerMiddleware, target: ErrorHandlerMiddleware, singleton: true },
      { type: TYPES.LoggerMiddleware, target: LoggerMiddleware, singleton: true },
      { type: TYPES.PrismaService, target: PrismaService, singleton: true }
    ]);
  }
}
