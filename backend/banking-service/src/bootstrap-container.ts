import "reflect-metadata";
import { Container } from "inversify";
import "./controllers/banking.controller.js";
import { BankingController } from "./controllers/banking.controller.js";
import { BankingRepository } from "./repositories/banking.repository.js";
import { ErrorHandlerMiddleware } from "./middlewares/error-handler.middleware.js";
import { LoggerMiddleware } from "./middlewares/logger.middleware.js";
import { BankingConfigService } from "./services/config.service.js";
import { BankingService } from "./services/banking.service.js";
import { TYPES } from "./bootstrap-type.js";
import { PrismaService } from "./services/prisma.service.js";

type Dependency<T> = {
  type: symbol;
  target: new (...args: never[]) => T;
  singleton: boolean;
};

/**
 * Shared helper for registering banking-service dependencies.
 */
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

/**
 * Banking-service dependency graph.
 */
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
      { type: TYPES.BankingController, target: BankingController, singleton: false },
      { type: TYPES.BankingRepository, target: BankingRepository, singleton: true },
      { type: TYPES.BankingService, target: BankingService, singleton: true },
      { type: TYPES.ConfigService, target: BankingConfigService, singleton: true },
      { type: TYPES.ErrorHandlerMiddleware, target: ErrorHandlerMiddleware, singleton: true },
      { type: TYPES.LoggerMiddleware, target: LoggerMiddleware, singleton: true },
      { type: TYPES.PrismaService, target: PrismaService, singleton: true }
    ]);
  }
}
