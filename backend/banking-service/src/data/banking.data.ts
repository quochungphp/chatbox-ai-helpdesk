import type { BankingApplication, BankingEmployee } from "../types/banking.type.js";

export const employees: BankingEmployee[] = [
  {
    id: "employee.vn@demo-bank.local",
    email: "employee.vn@demo-bank.local",
    fullName: "Lan Nguyen",
    department: "Retail Banking",
    location: "Ho Chi Minh City",
    employeeType: "permanent",
    jobTitle: "Retail Banking Specialist"
  },
  {
    id: "platform.engineer@demo-bank.local",
    email: "platform.engineer@demo-bank.local",
    fullName: "An Pham",
    department: "Cloud Platform Engineering",
    location: "Ho Chi Minh City",
    employeeType: "permanent",
    jobTitle: "Platform Engineer"
  },
  {
    id: "agent.vn@demo-bank.local",
    email: "agent.vn@demo-bank.local",
    fullName: "Minh Tran",
    department: "Workplace Technology",
    location: "Ho Chi Minh City",
    employeeType: "permanent",
    jobTitle: "Service Desk Agent"
  }
];

export const applications: BankingApplication[] = [
  {
    id: "app_digital_banking",
    name: "Digital Banking Portal",
    ownerDepartment: "Retail Banking",
    supportGroup: "Digital Workplace L2",
    allowedDepartments: ["Retail Banking", "Business Banking"],
    approvalRequired: true,
    riskLevel: "medium"
  },
  {
    id: "app_payments_ops",
    name: "Payments Operations Console",
    ownerDepartment: "Payments Technology",
    supportGroup: "Payments Application Support",
    allowedDepartments: ["Payments Technology"],
    approvalRequired: true,
    riskLevel: "high"
  },
  {
    id: "app_risk_case",
    name: "Risk Case Management",
    ownerDepartment: "Risk & Compliance",
    supportGroup: "Risk Technology Support",
    allowedDepartments: ["Risk & Compliance"],
    approvalRequired: true,
    riskLevel: "high"
  },
  {
    id: "app_azure_devops",
    name: "Azure DevOps",
    ownerDepartment: "Cloud Platform Engineering",
    supportGroup: "Cloud Platform Engineering",
    allowedDepartments: ["Cloud Platform Engineering"],
    approvalRequired: true,
    riskLevel: "high"
  },
  {
    id: "app_vpn",
    name: "VPN Secure Access",
    ownerDepartment: "Workplace Technology",
    supportGroup: "Network Access Support",
    allowedDepartments: ["Retail Banking", "Business Banking", "Payments Technology", "Risk & Compliance", "Cloud Platform Engineering"],
    approvalRequired: false,
    riskLevel: "medium"
  }
];
