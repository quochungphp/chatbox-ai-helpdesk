import { AuthClient } from "./clients/auth.client.js";
import { BankingClient } from "./clients/banking.client.js";
import { RagClient } from "./clients/rag.client.js";
import { TicketClient } from "./clients/ticket.client.js";
import { getSimulatorEnvironment } from "./config/environment.js";
import { ApiClient } from "./runtime/api-client.js";
import { assertGatewayReady } from "./runtime/preflight.js";
import { authUsers } from "../seeds/auth.seed.js";
import { bankingApplications, bankingEmployees } from "../seeds/banking.seed.js";
import { knowledgeDocuments } from "../seeds/rag.seed.js";
import { ticketSeeds } from "../seeds/ticket.seed.js";

/**
 * Seeds demo data through public service APIs. This keeps simulator behavior
 * close to production traffic and makes the demo independent of service internals.
 */
async function main(): Promise<void> {
  const env = getSimulatorEnvironment();
  await assertGatewayReady(env.apiBaseUrl);

  const apiClient = new ApiClient(env.apiBaseUrl);
  const authClient = new AuthClient(apiClient, env.serviceApiKey);
  const bankingClient = new BankingClient(apiClient);
  const ragClient = new RagClient(apiClient);
  const ticketClient = new TicketClient(apiClient);

  console.info("Seeding auth users");
  for (const user of authUsers) {
    const seeded = await authClient.ensureUser(user);
    console.info(`- ${seeded.email}`);
  }

  console.info("Seeding banking employees");
  for (const employee of bankingEmployees) {
    await bankingClient.upsertEmployee(employee);
    console.info(`- ${employee.email}`);
  }

  console.info("Seeding banking applications");
  for (const application of bankingApplications) {
    await bankingClient.upsertApplication({
      ...application,
      allowedDepartments: [...application.allowedDepartments]
    });
    console.info(`- ${application.name}`);
  }

  console.info("Seeding knowledge articles");
  const existingDocuments = await ragClient.listDocuments();
  const existingTitles = new Set(existingDocuments.map((document) => document.title));
  for (const document of knowledgeDocuments) {
    if (existingTitles.has(document.title)) {
      console.info(`- skipped existing: ${document.title}`);
      continue;
    }

    await ragClient.createDocument(document);
    console.info(`- ${document.title}`);
  }

  console.info("Seeding demo tickets");
  for (const ticket of ticketSeeds) {
    const seeded = await ticketClient.createTicket(ticket);
    console.info(`- ${seeded.ticketNumber}: ${seeded.title}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
