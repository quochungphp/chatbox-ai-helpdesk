import { inject } from "inversify";
import { BaseHttpController, controller, httpGet, httpPost, request, response } from "inversify-express-utils";
import type { Request, Response } from "express";
import { success } from "@ai-service-desk/shared/utils";
import { TYPES } from "../bootstrap-type.js";
import { AuthService } from "../services/auth.service.js";
import { loginSchema } from "../validators/auth.validator.js";
import { ValidationError } from "../utils/exceptions/validation-error.exception.js";

@controller("/api/auth")
export class AuthController extends BaseHttpController {
  constructor(@inject(TYPES.AuthService) private readonly authService: AuthService) {
    super();
  }

  @httpPost("/login")
  login(@request() req: Request, @response() res: Response): Response {
    const input = loginSchema.safeParse(req.body);

    if (!input.success) {
      throw new ValidationError("Invalid login input", input.error.flatten());
    }

    return res.json(success(this.authService.login(input.data)));
  }

  @httpGet("/profile")
  profile(@response() res: Response): Response {
    return res.json(success(this.authService.getDefaultProfile()));
  }
}

