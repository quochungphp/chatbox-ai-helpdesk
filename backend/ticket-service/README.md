# Ticket Service

Ticket Service owns ServiceNow-style ticket persistence and ticket history for the demo.

## Responsibilities

- Create tickets from chatbot or simulator input.
- List recent tickets for frontend panels.
- Read ticket details by ID or ticket number.
- Update ticket status/fields.
- Persist ticket history.
- Keep the ServiceNow connector behind an interface so it can be replaced later.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health`, `/ready` | Service health |
| `GET` | `/api/tickets` | List tickets |
| `POST` | `/api/tickets` | Create ticket |
| `GET` | `/api/tickets/:id` | Get ticket by ID or ticket number |
| `PATCH` | `/api/tickets/:id` | Update ticket |

## Related Services

- `api-gateway`: routes `/api/tickets/*` to this service.
- `chatbot-service`: creates tickets when escalation is required.
- `audit-service`: receives audit log writes from chatbot for ticket decisions.
- `notification-service`: receives notification requests from chatbot after ticket creation.
- `simulator`: seeds demo tickets and verifies ticket creation.
- `postgres`: stores tickets and history in `ticket_db`.
- `rabbitmq`: configured for future `ticket.created` event publishing.

## Environment

```text
PORT=4006
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:15432/ticket_db
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

## Local Commands

```bash
corepack pnpm --filter @ai-service-desk/ticket-service dev
corepack pnpm --filter @ai-service-desk/ticket-service typecheck
```
