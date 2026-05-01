import type { NextFunction, Request, Response } from "express";
import { BaseMiddleware } from "inversify-express-utils";
import { inject, injectable } from "inversify";
import { TYPES } from "../bootstrap-type.js";
import { AuthConfigService } from "../services/config.service.js";
import { UnauthorizedError } from "../utils/exceptions/unauthorized-error.exception.js";

/**
 * Protects internal user-provisioning routes with a simple service API key.
 */
@injectable()
export class ApiKeyMiddleware extends BaseMiddleware {
  constructor(@inject(TYPES.ConfigService) private readonly configService: AuthConfigService) {
    super();
  }

  /**
   * Rejects calls that do not provide the expected x-api-key header.
   */
  handler(req: Request, _res: Response, next: NextFunction): void {
    if (req.header("x-api-key") !== this.configService.serviceApiKey) {
      throw new UnauthorizedError("Invalid or missing API key");
    }

    next();
  }
}
