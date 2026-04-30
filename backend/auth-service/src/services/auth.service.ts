import jwt from "jsonwebtoken";
import { inject, injectable } from "inversify";
import { createId } from "@ai-service-desk/shared/utils";
import { TYPES } from "../bootstrap-type.js";
import { AuthConfigService } from "./config.service.js";
import { UserRepository } from "../repositories/user.repository.js";
import type { LoginInput } from "../validators/auth.validator.js";
import { PasswordService } from "./password.service.js";
import { UnauthorizedError } from "../utils/exceptions/unauthorized-error.exception.js";
import { serializeUser } from "../utils/serializers/user.serializer.js";

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.ConfigService) private readonly configService: AuthConfigService,
    @inject(TYPES.PasswordService) private readonly passwordService: PasswordService,
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository
  ) {}

  async login(input: LoginInput) {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const validPassword = await this.passwordService.verifyPassword(input.password, user.secretKey, user.passwordHash);

    if (!validPassword) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const safeUser = serializeUser(user);

    const token = this.signToken(safeUser);

    return { token, user: safeUser };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedError("User no longer exists");
    }

    return serializeUser(user);
  }

  signToken(user: ReturnType<typeof serializeUser>): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role.name,
        permissions: user.permissions.map((permission) => permission.name)
      },
      this.configService.jwtSecret,
      { expiresIn: "8h", jwtid: createId("jwt") }
    );
  }
}
