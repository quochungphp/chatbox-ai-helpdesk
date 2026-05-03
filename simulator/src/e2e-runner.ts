import { AuthClient } from "./clients/auth.client.js";
import { AuditClient } from "./clients/audit.client.js";
import { BankingClient } from "./clients/banking.client.js";
import { ChatbotClient } from "./clients/chatbot.client.js";
import { NotificationClient } from "./clients/notification.client.js";
import { RagClient } from "./clients/rag.client.js";
import { TicketClient } from "./clients/ticket.client.js";
import { getSimulatorEnvironment } from "./config/environment.js";
import { ApiClient } from "./runtime/api-client.js";
import { assertGatewayReady } from "./runtime/preflight.js";
import { runAccessRequestScenario } from "../scenarios/access-request.scenario.js";
import { runVpnTroubleshootingScenario } from "../scenarios/vpn-troubleshooting.scenario.js";

/**
 * Runs black-box e2e scenarios through API Gateway.
 */
async function main(): Promise<void> {
  const env = getSimulatorEnvironment();
  await assertGatewayReady(env.apiBaseUrl);

  const apiClient = new ApiClient(env.apiBaseUrl);
  const context = {
    authClient: new AuthClient(apiClient, env.serviceApiKey),
    auditClient: new AuditClient(apiClient),
    bankingClient: new BankingClient(apiClient),
    chatbotClient: new ChatbotClient(apiClient),
    notificationClient: new NotificationClient(apiClient),
    ragClient: new RagClient(apiClient),
    ticketClient: new TicketClient(apiClient)
  };

  console.info("Running VPN troubleshooting scenario");
  await runVpnTroubleshootingScenario(context);

  console.info("Running access request scenario");
  await runAccessRequestScenario(context);

  console.info("All simulator e2e scenarios passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
