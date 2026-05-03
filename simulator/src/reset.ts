import { getSimulatorEnvironment } from "./config/environment.js";
import { runCommand } from "./runtime/command.js";

const env = getSimulatorEnvironment();

const databases = [
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
    name: "banking-service",
    databaseUrl: env.databases.banking,
    filter: "@ai-service-desk/banking-service",
    schema: "prisma/schema.prisma"
  },
  {
    name: "notification-service",
    databaseUrl: env.databases.notification,
    filter: "@ai-service-desk/notification-service",
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
 * Drops and recreates simulator-managed databases through Prisma migrate reset.
 * This is intentionally destructive and should only be used for local demos.
 */
async function main(): Promise<void> {
  for (const database of databases) {
    console.info(`Resetting ${database.name}`);
    await runCommand({
      name: `${database.name} reset`,
      args: ["corepack", "pnpm", "--filter", database.filter, "exec", "prisma", "migrate", "reset", "--force", "--skip-seed", "--schema", database.schema],
      env: {
        DATABASE_URL: database.databaseUrl
      }
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
