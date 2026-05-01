import type { ApiResponse, Ticket } from "@ai-service-desk/shared/types";

export type BankingAccessCheck = {
  allowed: boolean;
  approvalRequired: boolean;
  reason: string;
  recommendedAssignmentGroup: string;
  recommendedPriority: Ticket["priority"];
  application: {
    name: string;
    supportGroup: string;
  } | null;
  employee: {
    department: string;
    fullName: string;
  } | null;
};

/**
 * HTTP client for Banking Service context.
 */
export class BankingClient {
  constructor(private readonly baseUrl = process.env.BANKING_SERVICE_URL ?? "http://localhost:4002") {}

  async checkAccess(input: { applicationName: string; userId: string }): Promise<BankingAccessCheck | null> {
    const response = await fetch(`${this.baseUrl}/api/banking/access/check`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ApiResponse<BankingAccessCheck>;
    return payload.success ? payload.data : null;
  }
}
