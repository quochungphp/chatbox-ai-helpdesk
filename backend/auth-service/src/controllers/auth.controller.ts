import { inject } from "inversify";
import { BaseHttpController, controller, httpGet, httpPost, request, response } from "inversify-express-utils";
import type { Request, Response } from "express";
import { success } from "@ai-service-desk/shared/utils";
import { TYPES } from "../bootstrap-type.js";
import { AuthService } from "../services/auth.service.js";
import { loginSchema } from "../validators/auth.validator.js";
import { ValidationError } from "../utils/exceptions/validation-error.exception.js";
import type { AuthenticatedRequest } from "../models/authenticated-request.js";

@controller("/api/auth")
export class AuthController extends BaseHttpController {
  constructor(@inject(TYPES.AuthService) private readonly authService: AuthService) {
    super();
  }

  @httpPost("/login")
  async login(@request() req: Request, @response() res: Response): Promise<Response> {
    const input = loginSchema.safeParse(req.body);

    if (!input.success) {
      throw new ValidationError("Invalid login input", input.error.flatten());
    }

    return res.json(success(await this.authService.login(input.data)));
  }

  @httpGet("/profile", TYPES.JwtAuthMiddleware)
  async profile(@request() req: AuthenticatedRequest, @response() res: Response): Promise<Response> {
    return res.json(success(await this.authService.getProfile(req.user!.id)));
  }
}

