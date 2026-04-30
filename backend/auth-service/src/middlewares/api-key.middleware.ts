import type { NextFunction, Request, Response } from "express";
import { BaseMiddleware } from "inversify-express-utils";
import { inject, injectable } from "inversify";
import { TYPES } from "../bootstrap-type.js";
import { AuthConfigService } from "../services/config.service.js";
import { UnauthorizedError } from "../utils/exceptions/unauthorized-error.exception.js";

@injectable()
export class ApiKeyMiddleware extends BaseMiddleware {
  constructor(@inject(TYPES.ConfigService) private readonly configService: AuthConfigService) {
    super();
  }

  handler(req: Request, _res: Response, next: NextFunction): void {
    if (req.header("x-api-key") !== this.configService.serviceApiKey) {
      throw new UnauthorizedError("Invalid or missing API key");
    }

    next();
  }
}

