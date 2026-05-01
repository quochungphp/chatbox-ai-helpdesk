import { AzureOpenAiProvider } from "../providers/azure-openai.provider.js";
import { FallbackAiProvider } from "../providers/fallback-ai.provider.js";
import type { AiProvider, GenerateAnswerInput } from "../types/ai.type.js";

/**
 * Application service for AI capabilities. It selects the configured provider
 * and exposes stable methods for controllers and future service callers.
 */
export class AiService {
  private readonly provider: AiProvider = createProvider();

  classifyIntent(message: string) {
    return this.provider.classifyIntent(message);
  }

  extractEntities(message: string) {
    return this.provider.extractEntities(message);
  }

  generateAnswer(input: GenerateAnswerInput) {
    return this.provider.generateAnswer(input);
  }
}

function createProvider(): AiProvider {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

  if (endpoint && apiKey && deployment) {
    return new AzureOpenAiProvider(endpoint, apiKey, deployment);
  }

  return new FallbackAiProvider();
}
