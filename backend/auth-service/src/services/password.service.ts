import bcrypt from "bcrypt";
import crypto from "crypto";
import { inject, injectable } from "inversify";
import { TYPES } from "../bootstrap-type.js";
import { AuthConfigService } from "./config.service.js";

/**
 * Centralizes password hashing policy. The raw password is combined with a
 * per-user secret key before bcrypt so equal passwords do not share input.
 */
@injectable()
export class PasswordService {
  constructor(@inject(TYPES.ConfigService) private readonly configService: AuthConfigService) {}

  /**
   * Creates a per-user secret used as an additional password hashing input.
   */
  generateSecretKey(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Hashes the password and user secret with the configured bcrypt cost.
   */
  hashPassword(password: string, secretKey: string): Promise<string> {
    return bcrypt.hash(this.combine(password, secretKey), this.configService.bcryptSaltRounds);
  }

  /**
   * Verifies a password attempt against the stored bcrypt hash.
   */
  verifyPassword(password: string, secretKey: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(this.combine(password, secretKey), passwordHash);
  }

  /**
   * Produces the exact secret-bearing value that bcrypt receives.
   */
  private combine(password: string, secretKey: string): string {
    return `${password}:${secretKey}`;
  }
}
