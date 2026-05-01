import { AuthClient } from "../src/clients/auth.client.js";
import { ChatbotClient } from "../src/clients/chatbot.client.js";
import { RagClient } from "../src/clients/rag.client.js";
import { assertScenario } from "../src/runtime/assert.js";
import { demoPassword } from "../seeds/auth.seed.js";

export type ScenarioContext = {
  authClient: AuthClient;
  chatbotClient: ChatbotClient;
  ragClient: RagClient;
};

/**
 * Validates the core RAG story: a workplace VPN issue should retrieve KB
 * context and the chatbot response should include a source citation.
 */
export async function runVpnTroubleshootingScenario(context: ScenarioContext): Promise<void> {
  const user = await context.authClient.login("employee.vn@demo-bank.local", demoPassword);
  const ragResults = await context.ragClient.search("VPN Secure Access is not working from home", 3);

  assertScenario(ragResults.length > 0, "Expected RAG search to return VPN knowledge context");

  const chatResponse = await context.chatbotClient.sendMessage({
    userId: user.id,
    message: "VPN Secure Access is not working from home and MFA keeps failing"
  });

  assertScenario(chatResponse.intent === "vpn_issue" || chatResponse.intent === "mfa_issue", "Expected VPN or MFA intent");
  assertScenario((chatResponse.sources?.length ?? 0) > 0, "Expected chatbot response to include RAG source");
}
