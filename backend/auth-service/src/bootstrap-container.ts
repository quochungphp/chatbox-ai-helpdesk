import "reflect-metadata";
import { Container } from "inversify";
import "./controllers/auth.controller.js";
import { AuthController } from "./controllers/auth.controller.js";
import { AuthService } from "./services/auth.service.js";
import { AuthConfigService } from "./services/config.service.js";
import { ErrorHandlerMiddleware } from "./middlewares/error-handler.middleware.js";
import { LoggerMiddleware } from "./middlewares/logger.middleware.js";
import { UserRepository } from "./repositories/user.repository.js";
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
      { type: TYPES.AuthController, target: AuthController, singleton: false },
      { type: TYPES.AuthService, target: AuthService, singleton: true },
      { type: TYPES.ConfigService, target: AuthConfigService, singleton: true },
      { type: TYPES.ErrorHandlerMiddleware, target: ErrorHandlerMiddleware, singleton: true },
      { type: TYPES.LoggerMiddleware, target: LoggerMiddleware, singleton: true },
      { type: TYPES.UserRepository, target: UserRepository, singleton: true }
    ]);
  }
}

