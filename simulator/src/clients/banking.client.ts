import { ApiClient } from "../runtime/api-client.js";

export type BankingEmployeeInput = {
  id: string;
  email: string;
  fullName: string;
  department: string;
  location: string;
  employeeType: "permanent" | "contractor";
  jobTitle: string;
};

export type BankingApplicationInput = {
  id: string;
  name: string;
  ownerDepartment: string;
  supportGroup: string;
  allowedDepartments: string[];
  approvalRequired: boolean;
  riskLevel: "low" | "medium" | "high";
};

export type BankingAccessCheck = {
  allowed: boolean;
  approvalRequired: boolean;
  recommendedAssignmentGroup: string;
  recommendedPriority: "P2" | "P3";
};

export class BankingClient {
  constructor(private readonly apiClient: ApiClient) {}

  upsertEmployee(input: BankingEmployeeInput) {
    return this.apiClient.request("/api/banking/employees", { method: "POST", body: input });
  }

  upsertApplication(input: BankingApplicationInput) {
    return this.apiClient.request("/api/banking/applications", { method: "POST", body: input });
  }

  checkAccess(input: { applicationName: string; userId: string }) {
    return this.apiClient.request<BankingAccessCheck>("/api/banking/access/check", { method: "POST", body: input });
  }
}
