import { getSimulatorEnvironment } from "./config/environment.js";
import { runCommand } from "./runtime/command.js";

const env = getSimulatorEnvironment();

const migrations = [
  {
    name: "audit-service",
    databaseUrl: env.databases.audit,
    filter: "@ai-service-desk/audit-service",
    schema: "prisma/schema.prisma"
  },
  {
    name: "auth-service",
    databaseUrl: env.databases.auth,
    filter: "@ai-service-desk/auth-service",
    schema: "prisma/schema.prisma"
  },
  {
    name: "rag-service",
    databaseUrl: env.databases.rag,
    filter: "@ai-service-desk/rag-service",
    schema: "prisma/schema.prisma"
  },
  {
    name: "ticket-service",
    databaseUrl: env.databases.ticket,
    filter: "@ai-service-desk/ticket-service",
    schema: "prisma/schema.prisma"
  }
];

/**
 * Applies Prisma migrations for service-owned databases that already have
 * schemas. Services without persistence are intentionally skipped.
 */
async function main(): Promise<void> {
  for (const migration of migrations) {
    console.info(`Applying migration for ${migration.name}`);
    await runCommand({
      name: `${migration.name} migrate`,
      args: ["corepack", "pnpm", "--filter", migration.filter, "exec", "prisma", "migrate", "deploy", "--schema", migration.schema],
      env: {
        DATABASE_URL: migration.databaseUrl
      }
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
