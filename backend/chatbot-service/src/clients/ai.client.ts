import type { ApiResponse, SupportIntent } from "@ai-service-desk/shared/types";

export type GenerateAiAnswerInput = {
  context: string[];
  intent: SupportIntent;
  message: string;
};

export type GenerateAiAnswerResult = {
  answer: string;
  confidence: number;
  grounded: boolean;
};

/**
 * HTTP client for AI Service. Chatbot delegates final answer generation here.
 */
export class AiClient {
  constructor(private readonly baseUrl = process.env.AI_SERVICE_URL ?? "http://localhost:4004") {}

  async generateAnswer(input: GenerateAiAnswerInput): Promise<GenerateAiAnswerResult> {
    const response = await fetch(`${this.baseUrl}/api/ai/generate-answer`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      return fallback(input);
    }

    const payload = (await response.json()) as ApiResponse<GenerateAiAnswerResult>;
    return payload.success ? payload.data : fallback(input);
  }
}

function fallback(input: GenerateAiAnswerInput): GenerateAiAnswerResult {
  if (input.context.length === 0) {
    return {
      answer: "I do not have enough verified knowledge base context to answer confidently. I recommend creating a service desk ticket.",
      confidence: 0.35,
      grounded: false
    };
  }

  return {
    answer: `Based on the approved knowledge base: ${input.context[0]}`,
    confidence: 0.75,
    grounded: true
  };
}
