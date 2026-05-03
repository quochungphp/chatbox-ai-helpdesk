import { z } from "zod";

export const accessCheckSchema = z.object({
  userId: z.string().trim().min(1),
  applicationName: z.string().trim().min(1).max(100)
});

export const upsertBankingEmployeeSchema = z.object({
  id: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(120),
  fullName: z.string().trim().min(1).max(120),
  department: z.string().trim().min(1).max(120),
  location: z.string().trim().min(1).max(120),
  employeeType: z.enum(["permanent", "contractor"]),
  jobTitle: z.string().trim().min(1).max(120)
});

export const upsertBankingApplicationSchema = z.object({
  id: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  ownerDepartment: z.string().trim().min(1).max(120),
  supportGroup: z.string().trim().min(1).max(120),
  allowedDepartments: z.array(z.string().trim().min(1).max(120)).min(1),
  approvalRequired: z.boolean(),
  riskLevel: z.enum(["low", "medium", "high"])
});

export type UpsertBankingEmployeeInput = z.infer<typeof upsertBankingEmployeeSchema>;
export type UpsertBankingApplicationInput = z.infer<typeof upsertBankingApplicationSchema>;
