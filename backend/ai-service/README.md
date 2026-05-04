# AI Service

AI Service owns AI provider integration and keeps chatbot orchestration decoupled from provider-specific details.

## Responsibilities

- Provide intent classification helper endpoint.
- Provide entity extraction helper endpoint.
- Generate final assistant answers from prompt/context input.
- Use deterministic fallback responses for local demo and CI.
- Use Azure OpenAI-compatible provider when Azure configuration is present.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health`, `/ready` | Service health |
| `POST` | `/api/ai/classify-intent` | Classify support intent |
| `POST` | `/api/ai/extract-entities` | Extract useful entities |
| `POST` | `/api/ai/generate-answer` | Generate final response |

## Related Services

- `chatbot-service`: primary caller for answer generation.
- `api-gateway`: not currently routing public `/api/ai/*`; AI Service is intended as an internal service.
- Azure OpenAI: optional production provider.

## Environment

```text
PORT=4004
OPENAI_API_KEY=
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_DEPLOYMENT=
```

If Azure variables are missing, the service uses the local deterministic fallback provider.

## Local Commands

```bash
corepack pnpm --filter @ai-service-desk/ai-service dev
corepack pnpm --filter @ai-service-desk/ai-service typecheck
```
