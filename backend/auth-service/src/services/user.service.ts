import { inject, injectable } from "inversify";
import { TYPES } from "../bootstrap-type.js";
import { AuthService } from "./auth.service.js";
import { PasswordService } from "./password.service.js";
import { UserRepository } from "../repositories/user.repository.js";
import type { UserChangePasswordInput, UserChangeProfileInput, UserSignupInput } from "../validators/auth.validator.js";
import { ConflictError } from "../utils/exceptions/conflict-error.exception.js";
import { ForbiddenError } from "../utils/exceptions/forbidden-error.exception.js";
import { NotFoundError } from "../utils/exceptions/not-found-error.exception.js";
import { serializeUser } from "../utils/serializers/user.serializer.js";

/**
 * Owns user lifecycle business rules: uniqueness checks, password hashing,
 * role assignment, and profile ownership validation.
 */
@injectable()
export class UserService {
  constructor(
    @inject(TYPES.AuthService) private readonly authService: AuthService,
    @inject(TYPES.PasswordService) private readonly passwordService: PasswordService,
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository
  ) {}

  /**
   * Creates a new user with a per-user secret key before bcrypt hashing.
   */
  async signup(input: UserSignupInput) {
    const existingUser = await this.userRepository.findByEmailOrUsername(input.email, input.username);

    if (existingUser) {
      throw new ConflictError("User has already conflicted");
    }

    const secretKey = this.passwordService.generateSecretKey();
    const passwordHash = await this.passwordService.hashPassword(input.password, secretKey);
    const user = await this.userRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username,
      email: input.email,
      phone: input.phone,
      passwordHash,
      secretKey,
      roleName: input.roleName
    });
    const safeUser = serializeUser(user);

    return {
      ...safeUser,
      token: this.authService.signToken(safeUser)
    };
  }

  /**
   * Returns a safe profile for an existing user id.
   */
  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return serializeUser(user);
  }

  /**
   * Re-hashes the new password with the user's existing secret key.
   */
  async changePassword(userId: string, input: UserChangePasswordInput) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const passwordHash = await this.passwordService.hashPassword(input.password, user.secretKey);
    const updatedUser = await this.userRepository.updatePassword(user.id, passwordHash);

    return serializeUser(updatedUser);
  }

  /**
   * Allows a user to update only their own profile fields.
   */
  async changeProfile(actorUserId: string, targetUserId: string, input: UserChangeProfileInput) {
    if (actorUserId !== targetUserId) {
      throw new ForbiddenError("User is not owner");
    }

    const user = await this.userRepository.findById(targetUserId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updatedUser = await this.userRepository.updateById(targetUserId, input);

    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    return serializeUser(updatedUser);
  }
}
