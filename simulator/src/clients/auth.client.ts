import type { UserRole } from "@ai-service-desk/shared/types";
import { ApiClient } from "../runtime/api-client.js";

export type DemoUserInput = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  roleName: UserRole;
  username: string;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  token: string;
};

/**
 * Simulator client for Auth Service endpoints through API Gateway.
 */
export class AuthClient {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly serviceApiKey: string
  ) {}

  /**
   * Creates a user if possible; if it already exists, logs in with the seed password.
   */
  async ensureUser(input: DemoUserInput): Promise<AuthenticatedUser> {
    try {
      return await this.apiClient.request<AuthenticatedUser>("/api/users", {
        method: "POST",
        headers: {
          "x-api-key": this.serviceApiKey
        },
        body: input
      });
    } catch {
      return this.login(input.email, input.password);
    }
  }

  async login(email: string, password: string): Promise<AuthenticatedUser> {
    return this.apiClient.request<AuthenticatedUser>("/api/auth/login", {
      method: "POST",
      body: { email, password }
    });
  }
}
