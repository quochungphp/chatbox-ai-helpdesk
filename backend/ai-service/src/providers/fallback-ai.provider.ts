import type { AiProvider, EntityExtractionResult, GenerateAnswerInput, GenerateAnswerResult, IntentClassificationResult } from "../types/ai.type.js";

/**
 * Deterministic provider used for local demo and CI when no AI key is present.
 */
export class FallbackAiProvider implements AiProvider {
  async classifyIntent(message: string): Promise<IntentClassificationResult> {
    const text = message.toLowerCase();

    if (hasAny(text, ["vpn", "globalprotect", "zscaler"])) return result("vpn_issue", 0.9);
    if (hasAny(text, ["email", "outlook", "mailbox"])) return result("email_issue", 0.86);
    if (hasAny(text, ["password", "reset password"])) return result("password_reset", 0.9);
    if (hasAny(text, ["mfa", "authenticator", "otp", "2fa"])) return result("mfa_issue", 0.86);
    if (hasAny(text, ["install", "software"])) return result("software_installation", 0.8);
    if (hasAny(text, ["access", "permission", "entitlement", "devops", "payments"])) return result("access_request", 0.84);
    if (hasAny(text, ["slow", "laptop", "cpu", "memory"])) return result("laptop_performance", 0.78);
    if (hasAny(text, ["network", "wifi", "wi-fi", "lan"])) return result("network_issue", 0.78);

    return result("unknown", 0.4);
  }

  async extractEntities(message: string): Promise<EntityExtractionResult> {
    return {
      urgency: /urgent|critical|asap|production down/i.test(message) ? "high" : /not urgent|low priority/i.test(message) ? "low" : "medium",
      affectedSystem: /payments operations console|azure devops|vpn secure access|mfa authenticator/i.exec(message)?.[0],
      errorMessage: /"([^"]+)"/.exec(message)?.[1] ?? /error[:\s]+(.+)/i.exec(message)?.[1]
    };
  }

  async generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerResult> {
    if (input.context.length === 0) {
      return {
        answer: "I do not have enough verified knowledge base context to answer confidently. I recommend creating a service desk ticket.",
        confidence: 0.35,
        grounded: false
      };
    }

    return {
      answer: `Based on the approved knowledge base: ${input.context[0]}`,
      confidence: 0.82,
      grounded: true
    };
  }
}

function result(intent: IntentClassificationResult["intent"], confidence: number): IntentClassificationResult {
  return { intent, confidence };
}

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}
