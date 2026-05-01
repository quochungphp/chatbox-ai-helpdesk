import type { SupportIntent } from "@ai-service-desk/shared/types";
import type { ExtractedEntities } from "../types/chat.type.js";

type TicketDecisionInput = {
  entities: ExtractedEntities;
  intent: SupportIntent;
  message: string;
};

type TicketDecision = {
  shouldCreateTicket: boolean;
  suggestedActions: string[];
};

export class TicketDecisionService {
  decide(input: TicketDecisionInput): TicketDecision {
    const asksForEscalation = /(ticket|escalate|human|service desk)/i.test(input.message);
    const urgent = input.entities.urgency === "high";
    const unknown = input.intent === "unknown";

    if (asksForEscalation || urgent || unknown) {
      return {
        shouldCreateTicket: true,
        suggestedActions: ["Create ticket", "Add more details", "Contact service desk"]
      };
    }

    return {
      shouldCreateTicket: false,
      suggestedActions: ["Try suggested fix", "Create ticket"]
    };
  }
}
