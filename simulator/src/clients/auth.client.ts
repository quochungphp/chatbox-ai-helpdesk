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

type AuthResponse = {
  token: string;
  user?: {
    id: string;
    email: string;
  };
  id?: string;
  email?: string;
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
      const response = await this.apiClient.request<AuthResponse>("/api/users", {
        method: "POST",
        headers: {
          "x-api-key": this.serviceApiKey
        },
        body: input
      });
      return normalizeAuthResponse(response);
    } catch {
      return this.login(input.email, input.password);
    }
  }

  async login(email: string, password: string): Promise<AuthenticatedUser> {
    const response = await this.apiClient.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: { email, password }
    });
    return normalizeAuthResponse(response);
  }
}

function normalizeAuthResponse(response: AuthResponse): AuthenticatedUser {
  return {
    id: response.user?.id ?? response.id ?? response.email ?? "",
    email: response.user?.email ?? response.email ?? "",
    token: response.token
  };
}
