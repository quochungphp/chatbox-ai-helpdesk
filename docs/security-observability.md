# Security And Observability

## Security

- API Gateway creates or forwards correlation IDs.
- JWT validation belongs at the API Gateway boundary.
- Service-to-service authentication is modeled through internal service configuration.
- Secrets must come from environment variables, Key Vault, or Azure DevOps Variable Groups.
- Prompt inputs and ticket metadata should be logged carefully to avoid sensitive data leakage.
- Production AKS should use network isolation and least-privilege identities.

## Observability

Every service should emit structured logs with:

- `correlationId`
- `requestId`
- `userId` when available
- `serviceName`
- `timestamp`

Azure production monitoring should track:

- API latency and error rate
- chatbot response time
- ticket creation count
- fallback rate
- RAG retrieval result count and confidence
- OpenAI token usage
- deployment health

