import { inject, injectable } from "inversify";
import { Prisma } from "../../generated/prisma-client/index.js";
import { TYPES } from "../bootstrap-type.js";
import { PrismaService } from "../services/prisma.service.js";
import type { UpsertBankingApplicationInput, UpsertBankingEmployeeInput } from "../validators/banking.validator.js";

@injectable()
export class BankingRepository {
  constructor(@inject(TYPES.PrismaService) private readonly prisma: PrismaService) {}

  listApplications() {
    return this.prisma.bankingApplication.findMany({
      orderBy: { name: "asc" }
    });
  }

  findEmployee(userId: string) {
    return this.prisma.bankingEmployee.findFirst({
      where: {
        OR: [{ id: userId }, { email: userId }]
      }
    });
  }

  findApplication(applicationName: string) {
    const text = applicationName.toLowerCase();

    return this.prisma.bankingApplication.findFirst({
      where: {
        OR: [
          { name: { equals: applicationName, mode: "insensitive" } },
          { name: { contains: applicationName, mode: "insensitive" } },
          ...knownApplicationName(text).map((name) => ({ name: { equals: name, mode: Prisma.QueryMode.insensitive } }))
        ]
      }
    });
  }

  upsertEmployee(input: UpsertBankingEmployeeInput) {
    return this.prisma.bankingEmployee.upsert({
      where: { id: input.id },
      update: input,
      create: input
    });
  }

  upsertApplication(input: UpsertBankingApplicationInput) {
    return this.prisma.bankingApplication.upsert({
      where: { id: input.id },
      update: input,
      create: input
    });
  }
}

function knownApplicationName(text: string): string[] {
  const names = ["Payments Operations Console", "Azure DevOps", "Risk Case Management", "Digital Banking Portal", "VPN Secure Access"];
  return names.filter((name) => text.includes(name.toLowerCase()));
}
