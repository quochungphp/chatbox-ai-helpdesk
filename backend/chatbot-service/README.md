# Chatbot Service

Chatbot Service is the main service desk orchestration service. It receives chat messages and decides whether to answer, ask for follow-up, or create a ticket.

## Responsibilities

- Receive chat messages from API Gateway.
- Classify support intent.
- Extract practical entities from the message.
- Search the knowledge base through RAG Service.
- Call AI Service for final answer generation.
- Call Banking Service for sensitive access context.
- Create tickets through Ticket Service when escalation is needed.
- Write audit logs.
- Request notifications after ticket creation.

## Endpoint

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health`, `/ready` | Service health |
| `POST` | `/api/chat/message` | Handle one chat message |

## Related Services

- `api-gateway`: routes `/api/chat/*` to this service.
- `ai-service`: generates final answer text.
- `rag-service`: retrieves knowledge base context.
- `banking-service`: checks access request policy.
- `ticket-service`: creates ServiceNow-style tickets.
- `audit-service`: stores AI/ticket decision trace.
- `notification-service`: stores user/team notification records.

## Environment

```text
PORT=4003
AI_SERVICE_URL=http://localhost:4004
RAG_SERVICE_URL=http://localhost:4005
TICKET_SERVICE_URL=http://localhost:4006
BANKING_SERVICE_URL=http://localhost:4002
AUDIT_SERVICE_URL=http://localhost:4008
NOTIFICATION_SERVICE_URL=http://localhost:4007
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

`RABBITMQ_URL` is reserved for event-driven expansion. Current local flow uses HTTP calls for audit and notification.

## Local Commands

```bash
corepack pnpm --filter @ai-service-desk/chatbot-service dev
corepack pnpm --filter @ai-service-desk/chatbot-service typecheck
```
