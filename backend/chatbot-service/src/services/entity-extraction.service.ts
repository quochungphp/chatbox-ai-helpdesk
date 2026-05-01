import type { ExtractedEntities } from "../types/chat.type.js";

export class EntityExtractionService {
  extract(message: string): ExtractedEntities {
    return {
      applicationName: extractAfter(message, ["application", "app", "system"]),
      urgency: extractUrgency(message),
      errorMessage: extractQuotedText(message)
    };
  }
}

function extractAfter(message: string, labels: string[]): string | undefined {
  for (const label of labels) {
    const match = new RegExp(`${label}\\s+([a-zA-Z0-9._ -]{2,40})`, "i").exec(message);

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return undefined;
}

function extractUrgency(message: string): ExtractedEntities["urgency"] {
  const text = message.toLowerCase();

  if (/(urgent|critical|asap|production down)/i.test(text)) {
    return "high";
  }

  if (/(not urgent|low priority|when possible)/i.test(text)) {
    return "low";
  }

  return "medium";
}

function extractQuotedText(message: string): string | undefined {
  const match = /"([^"]+)"/.exec(message);
  return match?.[1];
}
