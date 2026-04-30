import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { BaseMiddleware } from "inversify-express-utils";
import { inject, injectable } from "inversify";
import { TYPES } from "../bootstrap-type.js";
import type { AuthenticatedRequest, AuthenticatedUser } from "../models/authenticated-request.js";
import { AuthConfigService } from "../services/config.service.js";
import { UnauthorizedError } from "../utils/exceptions/unauthorized-error.exception.js";

type JwtPayload = jwt.JwtPayload & AuthenticatedUser;

@injectable()
export class JwtAuthMiddleware extends BaseMiddleware {
  constructor(@inject(TYPES.ConfigService) private readonly configService: AuthConfigService) {
    super();
  }

  handler(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
    const token = this.getBearerToken(req);

    if (!token) {
      throw new UnauthorizedError("Missing bearer token");
    }

    try {
      const payload = jwt.verify(token, this.configService.jwtSecret) as JwtPayload;
      req.user = {
        id: payload.sub ?? payload.id,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions ?? []
      };
      next();
    } catch {
      throw new UnauthorizedError("Invalid bearer token");
    }
  }

  private getBearerToken(req: AuthenticatedRequest): string | null {
    const authorization = req.header("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return null;
    }

    return authorization.slice("Bearer ".length);
  }
}

