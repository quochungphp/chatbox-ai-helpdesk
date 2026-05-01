import { inject } from "inversify";
import { BaseHttpController, controller, httpGet, httpPatch, httpPost, request, requestParam, response } from "inversify-express-utils";
import type { Response } from "express";
import { success } from "@ai-service-desk/shared/utils";
import { TYPES } from "../bootstrap-type.js";
import type { AuthenticatedRequest } from "../models/authenticated-request.js";
import { UserService } from "../services/user.service.js";
import { userChangePasswordSchema, userChangeProfileSchema, userSignupSchema } from "../validators/auth.validator.js";
import { ValidationError } from "../utils/exceptions/validation-error.exception.js";

/**
 * User management endpoints. Creation is protected by service API key because
 * it is intended for trusted internal callers, while profile actions use JWT.
 */
@controller("/api/users")
export class UserController extends BaseHttpController {
  constructor(@inject(TYPES.UserService) private readonly userService: UserService) {
    super();
  }

  /**
   * Creates a user, assigns a role, hashes the password, and returns a token.
   */
  @httpPost("/", TYPES.ApiKeyMiddleware)
  async create(@request() req: AuthenticatedRequest, @response() res: Response): Promise<Response> {
    const input = userSignupSchema.safeParse(req.body);

    if (!input.success) {
      throw new ValidationError("Invalid signup input", input.error.flatten());
    }

    return res.status(201).json(success(await this.userService.signup(input.data)));
  }

  /**
   * Lets the authenticated user replace their own password.
   */
  @httpPost("/change-password", TYPES.JwtAuthMiddleware)
  async changePassword(@request() req: AuthenticatedRequest, @response() res: Response): Promise<Response> {
    const input = userChangePasswordSchema.safeParse(req.body);

    if (!input.success) {
      throw new ValidationError("Invalid change password input", input.error.flatten());
    }

    return res.status(201).json(success(await this.userService.changePassword(req.user!.id, input.data)));
  }

  /**
   * Returns the authenticated user's persisted profile and access metadata.
   */
  @httpGet("/profile", TYPES.JwtAuthMiddleware)
  async profile(@request() req: AuthenticatedRequest, @response() res: Response): Promise<Response> {
    return res.json(success(await this.userService.getProfile(req.user!.id)));
  }

  /**
   * Updates profile fields only when the authenticated user owns the target id.
   */
  @httpPatch("/:id/profile", TYPES.JwtAuthMiddleware)
  async changeProfile(
    @request() req: AuthenticatedRequest,
    @requestParam("id") id: string,
    @response() res: Response
  ): Promise<Response> {
    const input = userChangeProfileSchema.safeParse(req.body);

    if (!input.success) {
      throw new ValidationError("Invalid change profile input", input.error.flatten());
    }

    return res.json(success(await this.userService.changeProfile(req.user!.id, id, input.data)));
  }
}
