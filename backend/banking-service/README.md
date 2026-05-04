# Banking Service

Banking Service provides demo enterprise banking context. It does not implement real banking operations.

## Responsibilities

- Store seeded banking employee profiles.
- Store seeded internal banking application catalog.
- Check whether an employee department is allowed for an application.
- Return whether approval is required.
- Recommend assignment group and priority for sensitive access requests.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health`, `/ready` | Service health |
| `GET` | `/api/banking/employees/:userId` | Get employee profile by email/user ID |
| `GET` | `/api/banking/applications` | List internal banking apps |
| `POST` | `/api/banking/access/check` | Check access and approval requirement |
| `POST` | `/api/banking/employees` | Seed/upsert employee profile |
| `POST` | `/api/banking/applications` | Seed/upsert application |

## Related Services

- `api-gateway`: routes `/api/banking/*` to this service.
- `chatbot-service`: calls access check before creating sensitive access tickets.
- `ticket-service`: receives tickets influenced by banking access decisions.
- `simulator`: seeds employee and application data.
- `postgres`: stores banking demo data in `banking_db`.

## Environment

```text
PORT=4002
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:15432/banking_db
```

## Local Commands

```bash
corepack pnpm --filter @ai-service-desk/banking-service dev
corepack pnpm --filter @ai-service-desk/banking-service typecheck
```
