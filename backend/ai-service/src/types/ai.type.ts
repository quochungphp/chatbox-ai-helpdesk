import type { SupportIntent } from "@ai-service-desk/shared/types";

export type IntentClassificationResult = {
  confidence: number;
  intent: SupportIntent;
};

export type EntityExtractionResult = {
  affectedSystem?: string;
  errorMessage?: string;
  urgency: "low" | "medium" | "high";
};

export type GenerateAnswerInput = {
  context: string[];
  intent: SupportIntent;
  message: string;
};

export type GenerateAnswerResult = {
  answer: string;
  confidence: number;
  grounded: boolean;
};

export interface AiProvider {
  classifyIntent(message: string): Promise<IntentClassificationResult>;
  extractEntities(message: string): Promise<EntityExtractionResult>;
  generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerResult>;
}
