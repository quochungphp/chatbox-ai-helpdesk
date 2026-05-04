# API Gateway

API Gateway is the single public backend entry point for the frontend and simulator. It owns cross-cutting HTTP concerns and forwards requests to internal services.

## Responsibilities

- Route public API paths to backend services.
- Create or forward correlation IDs.
- Apply request logging.
- Apply Redis-backed rate limiting with local fallback.
- Return consistent upstream unavailable errors.
- Keep frontend clients from calling every service directly.

## Routes

| Public route | Downstream service |
| --- | --- |
| `GET /health`, `GET /ready` | API Gateway |
| `GET /api` | API Gateway route metadata |
| `/api/auth/*` | auth-service |
| `/api/users/*` | auth-service |
| `/api/chat/*` | chatbot-service |
| `/api/tickets/*` | ticket-service |
| `/api/banking/*` | banking-service |
| `/api/admin/*` | audit-service |
| `/api/notifications/*` | notification-service |
| `/api/kb/*` | rag-service |

## Related Services

- `auth-service`: login, JWT profile, user management.
- `chatbot-service`: chat workflow.
- `ticket-service`: ticket list/create/update.
- `banking-service`: banking access context.
- `rag-service`: knowledge base APIs.
- `audit-service`: dashboard/admin APIs.
- `notification-service`: notification APIs.
- `redis`: rate limiting store.

## Environment

```text
PORT=8080
AUTH_SERVICE_URL=http://localhost:4001
BANKING_SERVICE_URL=http://localhost:4002
CHATBOT_SERVICE_URL=http://localhost:4003
RAG_SERVICE_URL=http://localhost:4005
TICKET_SERVICE_URL=http://localhost:4006
AUDIT_SERVICE_URL=http://localhost:4008
NOTIFICATION_SERVICE_URL=http://localhost:4007
REDIS_URL=redis://127.0.0.1:6379
```

## Local Commands

```bash
corepack pnpm --filter @ai-service-desk/api-gateway dev
corepack pnpm --filter @ai-service-desk/api-gateway typecheck
corepack pnpm --filter @ai-service-desk/api-gateway test
```
