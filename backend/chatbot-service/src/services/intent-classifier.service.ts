import type { SupportIntent } from "@ai-service-desk/shared/types";

export type IntentClassificationResult = {
  confidence: number;
  intent: SupportIntent;
};

/**
 * Rule-based intent classifier for the skeleton. It gives the demo predictable
 * behavior now and can later be replaced or augmented by AI Service.
 */
export class IntentClassifierService {
  /**
   * Maps support keywords to the shared SupportIntent contract.
   */
  classify(message: string): IntentClassificationResult {
    const text = message.toLowerCase();

    if (hasAny(text, ["vpn", "globalprotect", "zscaler"])) return result("vpn_issue", 0.9);
    if (hasAny(text, ["email", "outlook", "mailbox"])) return result("email_issue", 0.86);
    if (hasAny(text, ["password", "forgot password", "reset password"])) return result("password_reset", 0.9);
    if (hasAny(text, ["mfa", "authenticator", "otp", "2fa"])) return result("mfa_issue", 0.86);
    if (hasAny(text, ["install", "software", "application install"])) return result("software_installation", 0.82);
    if (hasAny(text, ["access", "permission", "entitlement"])) return result("access_request", 0.82);
    if (hasAny(text, ["slow", "laptop", "performance", "cpu", "memory"])) return result("laptop_performance", 0.78);
    if (hasAny(text, ["network", "wifi", "wi-fi", "lan"])) return result("network_issue", 0.78);

    return result("unknown", 0.4);
  }
}

/**
 * Produces a normalized classifier result.
 */
function result(intent: SupportIntent, confidence: number): IntentClassificationResult {
  return { intent, confidence };
}

/**
 * Checks whether a normalized message contains any known intent keyword.
 */
function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}
