import type { Application } from "express";
import { InversifyContainer } from "../../src/bootstrap-container.js";
import { TYPES } from "../../src/bootstrap-type.js";
import { BootstrapApp } from "../../src/bootstrap-app.js";
import { AuthConfigService } from "../../src/services/config.service.js";
import { PrismaService } from "../../src/services/prisma.service.js";

export type AuthServiceTestContext = {
  app: Application;
  serviceApiKey: string;
  resetData: () => Promise<void>;
  disconnect: () => Promise<void>;
};

export async function setupContinuousIntegrationTest(): Promise<AuthServiceTestContext> {
  const container = new InversifyContainer().getContainer();
  const configService = container.get<AuthConfigService>(TYPES.ConfigService);
  const prisma = container.get<PrismaService>(TYPES.PrismaService);

  const bootstrapApp = await new BootstrapApp(container).setup();

  return {
    app: bootstrapApp.getServer(),
    serviceApiKey: configService.serviceApiKey,
    resetData: async () => resetAuthData(prisma),
    disconnect: async () => prisma.$disconnect()
  };
}

async function resetAuthData(prisma: PrismaService): Promise<void> {
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.rolePermission.deleteMany(),
    prisma.permission.deleteMany(),
    prisma.role.deleteMany()
  ]);
}
