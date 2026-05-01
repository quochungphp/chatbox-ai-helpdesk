export type BankingEmployee = {
  id: string;
  email: string;
  fullName: string;
  department: string;
  location: string;
  employeeType: "permanent" | "contractor";
  jobTitle: string;
};

export type BankingApplication = {
  id: string;
  name: string;
  ownerDepartment: string;
  supportGroup: string;
  allowedDepartments: string[];
  approvalRequired: boolean;
  riskLevel: "low" | "medium" | "high";
};

export type AccessCheckInput = {
  applicationName: string;
  userId: string;
};

export type AccessCheckResult = {
  allowed: boolean;
  approvalRequired: boolean;
  reason: string;
  employee: BankingEmployee | null;
  application: BankingApplication | null;
  recommendedAssignmentGroup: string;
  recommendedPriority: "P2" | "P3";
};
