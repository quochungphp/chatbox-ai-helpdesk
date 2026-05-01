import { FallbackAiProvider } from "./fallback-ai.provider.js";
import type { AiProvider, GenerateAnswerInput, GenerateAnswerResult } from "../types/ai.type.js";

/**
 * Azure OpenAI-ready provider. It uses REST fetch directly so the service does
 * not need an SDK dependency. Classification/entity extraction still fallback
 * until prompts are hardened.
 */
export class AzureOpenAiProvider extends FallbackAiProvider implements AiProvider {
  constructor(
    private readonly endpoint: string,
    private readonly apiKey: string,
    private readonly deployment: string
  ) {
    super();
  }

  override async generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerResult> {
    if (input.context.length === 0) {
      return super.generateAnswer(input);
    }

    try {
      const response = await fetch(
        `${this.endpoint.replace(/\/$/, "")}/openai/deployments/${this.deployment}/chat/completions?api-version=2024-02-15-preview`,
        {
          method: "POST",
          headers: {
            "api-key": this.apiKey,
            "content-type": "application/json"
          },
          body: JSON.stringify({
            temperature: 0.2,
            messages: [
              {
                role: "system",
                content:
                  "You are an enterprise IT service desk assistant. Answer only from provided context. Do not ask for passwords, MFA codes, tokens, or customer data."
              },
              {
                role: "user",
                content: `User issue: ${input.message}\nIntent: ${input.intent}\nContext:\n${input.context.join("\n---\n")}`
              }
            ]
          })
        }
      );

      if (!response.ok) {
        return super.generateAnswer(input);
      }

      const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const answer = payload.choices?.[0]?.message?.content?.trim();

      return answer ? { answer, confidence: 0.86, grounded: true } : super.generateAnswer(input);
    } catch {
      return super.generateAnswer(input);
    }
  }
}
