import { inject, injectable } from "inversify";
import { TYPES } from "../bootstrap-type.js";
import { BankingRepository } from "../repositories/banking.repository.js";
import type { AccessCheckInput, AccessCheckResult, BankingApplication, BankingEmployee } from "../types/banking.type.js";
import type { UpsertBankingApplicationInput, UpsertBankingEmployeeInput } from "../validators/banking.validator.js";

/**
 * Mock banking domain service for employee/application context and access checks.
 */
@injectable()
export class BankingService {
  constructor(@inject(TYPES.BankingRepository) private readonly repository: BankingRepository) {}

  async listApplications(): Promise<BankingApplication[]> {
    const applications = await this.repository.listApplications();
    return applications.map(toApplication);
  }

  async getEmployee(userId: string): Promise<BankingEmployee | null> {
    const employee = await this.repository.findEmployee(userId);
    return employee ? toEmployee(employee) : null;
  }

  async checkAccess(input: AccessCheckInput): Promise<AccessCheckResult> {
    const [employeeRecord, applicationRecord] = await Promise.all([
      this.repository.findEmployee(input.userId),
      this.repository.findApplication(input.applicationName)
    ]);
    const employee = employeeRecord ? toEmployee(employeeRecord) : null;
    const application = applicationRecord ? toApplication(applicationRecord) : null;

    if (!employee) {
      return result(false, true, "Employee profile was not found.", employee, application);
    }

    if (!application) {
      return result(false, true, "Application was not found in the banking catalog.", employee, application);
    }

    const departmentAllowed = application.allowedDepartments.includes(employee.department);

    if (!departmentAllowed) {
      return result(
        false,
        true,
        `${employee.department} is not pre-approved for ${application.name}. Manager and application owner approval are required.`,
        employee,
        application
      );
    }

    if (application.approvalRequired) {
      return result(true, true, `${application.name} requires approval workflow before access can be granted.`, employee, application);
    }

    return result(true, false, `${employee.department} is eligible for ${application.name}.`, employee, application);
  }

  upsertEmployee(input: UpsertBankingEmployeeInput): Promise<BankingEmployee> {
    return this.repository.upsertEmployee(input).then(toEmployee);
  }

  upsertApplication(input: UpsertBankingApplicationInput): Promise<BankingApplication> {
    return this.repository.upsertApplication(input).then(toApplication);
  }
}

function result(
  allowed: boolean,
  approvalRequired: boolean,
  reason: string,
  employee: BankingEmployee | null,
  application: BankingApplication | null
): AccessCheckResult {
  return {
    allowed,
    approvalRequired,
    reason,
    employee,
    application,
    recommendedAssignmentGroup: application?.supportGroup ?? "Service Desk L1",
    recommendedPriority: application?.riskLevel === "high" ? "P2" : "P3"
  };
}

function toEmployee(employee: {
  id: string;
  email: string;
  fullName: string;
  department: string;
  location: string;
  employeeType: string;
  jobTitle: string;
}): BankingEmployee {
  return {
    ...employee,
    employeeType: employee.employeeType as BankingEmployee["employeeType"]
  };
}

function toApplication(application: {
  id: string;
  name: string;
  ownerDepartment: string;
  supportGroup: string;
  allowedDepartments: string[];
  approvalRequired: boolean;
  riskLevel: string;
}): BankingApplication {
  return {
    ...application,
    riskLevel: application.riskLevel as BankingApplication["riskLevel"]
  };
}
