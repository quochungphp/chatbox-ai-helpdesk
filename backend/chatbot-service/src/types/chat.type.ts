import type { SupportIntent } from "@ai-service-desk/shared/types";

export type ChatMessageInput = {
  conversationId?: string;
  userId: string;
  message: string;
};

export type ExtractedEntities = {
  applicationName?: string;
  urgency: "low" | "medium" | "high";
  errorMessage?: string;
};

export type ChatOrchestrationStep =
  | "message_received"
  | "intent_classified"
  | "entities_extracted"
  | "ticket_decision_made";

export type IntentClassification = {
  confidence: number;
  intent: SupportIntent;
};
