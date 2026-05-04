# Backend Services

This folder contains independently runnable backend services for the AI Service Desk demo. Each service owns its own runtime boundary and should be treated as a separate deployable unit.

## Local Ports

| Service | Port | Responsibility |
| --- | ---: | --- |
| api-gateway | 8080 | Public entry point, routing, rate limit, correlation IDs |
| auth-service | 4001 | Login, JWT, users, roles, permissions |
| banking-service | 4002 | Demo banking employee/application access context |
| chatbot-service | 4003 | Main chat orchestration workflow |
| ai-service | 4004 | AI provider abstraction, local fallback, Azure OpenAI-ready provider |
| rag-service | 4005 | Knowledge base ingestion and retrieval |
| ticket-service | 4006 | ServiceNow-style ticket persistence |
| notification-service | 4007 | Email/Teams/Slack notification records |
| audit-service | 4008 | Audit logs and admin metrics |

## Service Relationship Summary

```text
frontend
  -> api-gateway
      -> auth-service
      -> chatbot-service
      -> ticket-service
      -> banking-service
      -> rag-service
      -> audit-service
      -> notification-service

chatbot-service
  -> ai-service
  -> rag-service
  -> banking-service
  -> ticket-service
  -> audit-service
  -> notification-service
```

## Local Demo

Use the root script for a clean local demo:

```bash
corepack pnpm demo:fresh
```

Open the frontend at:

```text
http://localhost:3000
```

API Gateway health check:

```text
http://localhost:8080/health
```
