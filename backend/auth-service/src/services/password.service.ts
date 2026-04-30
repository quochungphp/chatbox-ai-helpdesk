import bcrypt from "bcrypt";
import crypto from "crypto";
import { inject, injectable } from "inversify";
import { TYPES } from "../bootstrap-type.js";
import { AuthConfigService } from "./config.service.js";

@injectable()
export class PasswordService {
  constructor(@inject(TYPES.ConfigService) private readonly configService: AuthConfigService) {}

  generateSecretKey(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  hashPassword(password: string, secretKey: string): Promise<string> {
    return bcrypt.hash(this.combine(password, secretKey), this.configService.bcryptSaltRounds);
  }

  verifyPassword(password: string, secretKey: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(this.combine(password, secretKey), passwordHash);
  }

  private combine(password: string, secretKey: string): string {
    return `${password}:${secretKey}`;
  }
}

