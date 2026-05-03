import { AuthClient } from "../src/clients/auth.client.js";
import { AuditClient } from "../src/clients/audit.client.js";
import { BankingClient } from "../src/clients/banking.client.js";
import { ChatbotClient } from "../src/clients/chatbot.client.js";
import { NotificationClient } from "../src/clients/notification.client.js";
import { TicketClient } from "../src/clients/ticket.client.js";
import { assertScenario } from "../src/runtime/assert.js";
import { demoPassword } from "../seeds/auth.seed.js";

export type AccessRequestScenarioContext = {
  auditClient: AuditClient;
  authClient: AuthClient;
  bankingClient: BankingClient;
  chatbotClient: ChatbotClient;
  notificationClient: NotificationClient;
  ticketClient: TicketClient;
};

/**
 * Validates a sensitive banking application flow where chatbot guidance is
 * followed by ServiceNow-style ticket creation.
 */
export async function runAccessRequestScenario(context: AccessRequestScenarioContext): Promise<void> {
  const user = await context.authClient.login("employee.vn@demo-bank.local", demoPassword);
  const accessCheck = await context.bankingClient.checkAccess({
    applicationName: "Payments Operations Console",
    userId: user.email
  });

  assertScenario(accessCheck.approvalRequired, "Expected banking access check to require approval");
  assertScenario(accessCheck.recommendedAssignmentGroup === "Payments Application Support", "Expected Payments support assignment group");

  const chatResponse = await context.chatbotClient.sendMessage({
    userId: user.email,
    message: "I need access to Payments Operations Console"
  });

  assertScenario(chatResponse.intent === "access_request", "Expected access_request intent");
  assertScenario(chatResponse.ticket, "Expected chatbot to create a ticket for access approval");
  assertScenario(chatResponse.ticket.assignmentGroup === "Payments Application Support", "Expected ticket to use banking assignment group");
  assertScenario(chatResponse.ticket.priority === "P2", "Expected high-risk banking application to create P2 ticket");

  const tickets = await context.ticketClient.listTickets();
  assertScenario(tickets.some((ticket) => ticket.id === chatResponse.ticket?.id), "Expected ticket to be persisted");

  await waitForSideEffects();
  const auditLogs = await context.auditClient.listLogs();
  assertScenario(auditLogs.some((log) => log.eventType === "ticket.created" && log.ticketId === chatResponse.ticket?.id), "Expected ticket.created audit log");

  const notifications = await context.notificationClient.listNotifications();
  assertScenario(notifications.some((notification) => notification.recipient === user.email), "Expected persisted notification for user");
}

function waitForSideEffects(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 250));
}
