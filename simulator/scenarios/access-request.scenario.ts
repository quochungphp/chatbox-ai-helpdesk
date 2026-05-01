import { AuthClient } from "../src/clients/auth.client.js";
import { ChatbotClient } from "../src/clients/chatbot.client.js";
import { TicketClient } from "../src/clients/ticket.client.js";
import { assertScenario } from "../src/runtime/assert.js";
import { demoPassword } from "../seeds/auth.seed.js";

export type AccessRequestScenarioContext = {
  authClient: AuthClient;
  chatbotClient: ChatbotClient;
  ticketClient: TicketClient;
};

/**
 * Validates a sensitive banking application flow where chatbot guidance is
 * followed by ServiceNow-style ticket creation.
 */
export async function runAccessRequestScenario(context: AccessRequestScenarioContext): Promise<void> {
  const user = await context.authClient.login("platform.engineer@demo-bank.local", demoPassword);
  const chatResponse = await context.chatbotClient.sendMessage({
    userId: user.id,
    message: "I need Azure DevOps production pipeline access for an urgent release"
  });

  assertScenario(chatResponse.intent === "access_request", "Expected access_request intent");

  const ticket = await context.ticketClient.createTicket({
    title: "Azure DevOps production pipeline access",
    description: chatResponse.answer,
    category: "Cloud Platform",
    priority: "P2",
    assignmentGroup: "Cloud Platform Engineering",
    conversationId: chatResponse.conversationId,
    createdBy: user.email
  });

  assertScenario(ticket.ticketNumber.startsWith("SNOW"), "Expected mock ServiceNow ticket number");
}
