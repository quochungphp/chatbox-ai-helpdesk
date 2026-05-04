# Auth Service

Auth Service owns demo identity, users, roles, permissions, password hashing, and JWT issuance.

## Responsibilities

- Create demo users through an internal API key protected endpoint.
- Authenticate users by email/password.
- Hash passwords with bcrypt.
- Store per-user secret keys for password hashing strategy.
- Issue JWT tokens.
- Return authenticated profiles.
- Support role and permission data for RBAC demonstrations.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health`, `/ready` | Service health |
| `POST` | `/api/auth/login` | Login and return JWT |
| `GET` | `/api/auth/profile` | Current auth profile |
| `POST` | `/api/users` | Create user, API key protected |
| `POST` | `/api/users/change-password` | Change password, JWT protected |
| `GET` | `/api/users/profile` | Current user profile, JWT protected |
| `PATCH` | `/api/users/:id/profile` | Update user profile, JWT protected |

## Related Services

- `api-gateway`: routes `/api/auth/*` and `/api/users/*` to this service.
- `chatbot-service`: receives user identity from frontend requests and uses seeded demo users for scenarios.
- `simulator`: seeds demo users and logs in during e2e scenarios.
- `postgres`: stores users, roles, permissions, and password metadata in `auth_db`.

## Environment

```text
PORT=4001
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:15432/auth_db
JWT_SECRET=replace-with-local-dev-secret
SERVICE_API_KEY=local-service-api-key
BCRYPT_SALT_ROUNDS=12
```

## Local Commands

```bash
corepack pnpm --filter @ai-service-desk/auth-service dev
corepack pnpm --filter @ai-service-desk/auth-service typecheck
corepack pnpm --filter @ai-service-desk/auth-service test
```
