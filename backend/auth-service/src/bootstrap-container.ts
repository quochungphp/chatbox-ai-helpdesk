import "reflect-metadata";
import { Container } from "inversify";
import "./controllers/auth.controller.js";
import "./controllers/user.controller.js";
import { AuthController } from "./controllers/auth.controller.js";
import { UserController } from "./controllers/user.controller.js";
import { AuthService } from "./services/auth.service.js";
import { AuthConfigService } from "./services/config.service.js";
import { PasswordService } from "./services/password.service.js";
import { PrismaService } from "./services/prisma.service.js";
import { UserService } from "./services/user.service.js";
import { ApiKeyMiddleware } from "./middlewares/api-key.middleware.js";
import { ErrorHandlerMiddleware } from "./middlewares/error-handler.middleware.js";
import { JwtAuthMiddleware } from "./middlewares/jwt-auth.middleware.js";
import { LoggerMiddleware } from "./middlewares/logger.middleware.js";
import { UserRepository } from "./repositories/user.repository.js";
import { TYPES } from "./bootstrap-type.js";

type Dependency<T> = {
  type: symbol;
  target: new (...args: never[]) => T;
  singleton: boolean;
};

/**
 * Small helper around Inversify registration so service bindings stay
 * explicit and easy to audit in an interview/code review.
 */
export class BaseInversifyContainer {
  protected readonly container: Container;

  constructor() {
    this.container = new Container({ defaultScope: "Transient" });
  }

  /**
   * Registers a list of dependencies with optional singleton lifetime.
   */
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
 * Auth-service dependency graph. Controllers are transient while shared
 * infrastructure such as Prisma, config, and services are singletons.
 */
export class InversifyContainer extends BaseInversifyContainer {
  constructor() {
    super();
    this.registerDependencies();
  }

  /**
   * Returns the configured container used by inversify-express-utils.
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Central place to map TYPES tokens to concrete implementations.
   */
  private registerDependencies(): void {
    this.registerContainer([
      { type: TYPES.ApiKeyMiddleware, target: ApiKeyMiddleware, singleton: true },
      { type: TYPES.AuthController, target: AuthController, singleton: false },
      { type: TYPES.AuthService, target: AuthService, singleton: true },
      { type: TYPES.ConfigService, target: AuthConfigService, singleton: true },
      { type: TYPES.ErrorHandlerMiddleware, target: ErrorHandlerMiddleware, singleton: true },
      { type: TYPES.JwtAuthMiddleware, target: JwtAuthMiddleware, singleton: true },
      { type: TYPES.LoggerMiddleware, target: LoggerMiddleware, singleton: true },
      { type: TYPES.PasswordService, target: PasswordService, singleton: true },
      { type: TYPES.PrismaService, target: PrismaService, singleton: true },
      { type: TYPES.UserController, target: UserController, singleton: false },
      { type: TYPES.UserRepository, target: UserRepository, singleton: true },
      { type: TYPES.UserService, target: UserService, singleton: true }
    ]);
  }
}
