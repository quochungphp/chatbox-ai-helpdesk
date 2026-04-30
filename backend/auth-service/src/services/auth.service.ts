import jwt from "jsonwebtoken";
import { inject, injectable } from "inversify";
import { createId } from "@ai-service-desk/shared/utils";
import { TYPES } from "../bootstrap-type.js";
import { AuthConfigService } from "./config.service.js";
import { UserRepository } from "../repositories/user.repository.js";
import type { LoginInput } from "../validators/auth.validator.js";

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.ConfigService) private readonly configService: AuthConfigService,
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository
  ) {}

  login(input: LoginInput) {
    const user = this.userRepository.findByEmail(input.email) ?? this.userRepository.getDefaultUser();
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        department: user.department
      },
      this.configService.jwtSecret,
      { expiresIn: "8h", jwtid: createId("jwt") }
    );

    return { token, user };
  }

  getDefaultProfile() {
    return this.userRepository.getDefaultUser();
  }
}

