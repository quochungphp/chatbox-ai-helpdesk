# Notification Service

Notification Service stores local email, Teams, and Slack style notification records for demo workflows.

## Responsibilities

- Create notification records after important workflow events.
- List notifications for simulator/e2e verification.
- Read a notification by ID.
- Persist delivery channel, recipient, subject, body, status, and metadata.
- Act as the future boundary for real email/Teams/Slack integrations.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health`, `/ready` | Service health |
| `GET` | `/api/notifications` | List notifications |
| `GET` | `/api/notifications/:id` | Get notification by ID |
| `POST` | `/api/notifications` | Create notification record |

## Related Services

- `api-gateway`: routes `/api/notifications/*` to this service.
- `chatbot-service`: creates notification records after ticket creation.
- `ticket-service`: future event source for `ticket.created`.
- `simulator`: verifies notification records in e2e flows.
- `postgres`: stores notifications in `notification_db`.
- `rabbitmq`: configured for future event consumption.

## Environment

```text
PORT=4007
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:15432/notification_db
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

## Local Commands

```bash
corepack pnpm --filter @ai-service-desk/notification-service dev
corepack pnpm --filter @ai-service-desk/notification-service typecheck
```
