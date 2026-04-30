import type { SupportIntent, TicketPriority } from "../types/index.js";

export type DomainEventBase<TType extends string, TPayload> = {
  eventId: string;
  eventType: TType;
  correlationId: string;
  occurredAt: string;
  payload: TPayload;
};

export type IntentClassifiedEvent = DomainEventBase<
  "intent.classified",
  {
    conversationId: string;
    userId: string;
    intent: SupportIntent;
    confidence: number;
  }
>;

export type RagSearchPerformedEvent = DomainEventBase<
  "rag.search.performed",
  {
    conversationId: string;
    query: string;
    resultCount: number;
  }
>;

export type TicketCreatedEvent = DomainEventBase<
  "ticket.created",
  {
    ticketId: string;
    conversationId: string;
    userId: string;
    priority: TicketPriority;
  }
>;

export type NotificationRequestedEvent = DomainEventBase<
  "notification.requested",
  {
    channel: "email" | "teams" | "slack";
    recipient: string;
    subject: string;
  }
>;

export type ServiceDeskEvent =
  | IntentClassifiedEvent
  | RagSearchPerformedEvent
  | TicketCreatedEvent
  | NotificationRequestedEvent;
