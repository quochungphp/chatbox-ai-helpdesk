# Audit Service

Audit Service stores workflow traceability data and exposes admin metrics for the demo dashboard.

## Responsibilities

- Store audit logs for user actions, AI decisions, ticket creation, and notification requests.
- Return recent audit logs for admin/simulator verification.
- Aggregate basic admin dashboard metrics.
- Preserve metadata as JSON for flexible traceability.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health`, `/ready` | Service health |
| `GET` | `/api/admin/metrics` | Dashboard metrics |
| `GET` | `/api/admin/audit-logs` | List audit logs |
| `POST` | `/api/admin/audit-logs` | Create audit log |

## Related Services

- `api-gateway`: routes `/api/admin/*` to this service.
- `chatbot-service`: writes audit records during chat and ticket workflows.
- `ticket-service`: future event source for ticket audit events.
- `notification-service`: related to notification audit records.
- `simulator`: verifies audit data in e2e flows.
- `postgres`: stores audit logs in `audit_db`.
- `rabbitmq`: configured for future event consumption.

## Environment

```text
PORT=4008
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:15432/audit_db
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

## Local Commands

```bash
corepack pnpm --filter @ai-service-desk/audit-service dev
corepack pnpm --filter @ai-service-desk/audit-service typecheck
```
