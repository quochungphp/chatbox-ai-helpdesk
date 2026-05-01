import { injectable } from "inversify";
import { applications, employees } from "../data/banking.data.js";
import type { AccessCheckInput, AccessCheckResult, BankingApplication, BankingEmployee } from "../types/banking.type.js";

/**
 * Mock banking domain service for employee/application context and access checks.
 */
@injectable()
export class BankingService {
  listApplications(): BankingApplication[] {
    return applications;
  }

  getEmployee(userId: string): BankingEmployee | null {
    return employees.find((employee) => employee.id === userId || employee.email === userId) ?? null;
  }

  checkAccess(input: AccessCheckInput): AccessCheckResult {
    const employee = this.getEmployee(input.userId);
    const application = findApplication(input.applicationName);

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
}

function findApplication(name: string): BankingApplication | null {
  const text = name.toLowerCase();
  return applications.find((application) => application.name.toLowerCase() === text || application.name.toLowerCase().includes(text) || text.includes(application.name.toLowerCase())) ?? null;
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
