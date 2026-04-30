# AI Service Desk Automation Platform

Microservices monorepo skeleton for an enterprise AI-powered IT service desk demo. The repository is organized for independent backend service builds, Docker deployment, Azure-ready infrastructure, and a React frontend.

## Structure

```text
apps/frontend
backend/api-gateway
backend/auth-service
backend/banking-service
backend/chatbot-service
backend/ai-service
backend/rag-service
backend/ticket-service
backend/notification-service
backend/audit-service
shared/package.json
shared/types
shared/events
shared/config
shared/logger
shared/utils
infra/k8s
.azure-pipelines
docs
```

## Local Development

Use the project Node and pnpm versions first. The project pins Node in `.nvmrc` and pnpm in `package.json`.

```bash
nvm use
corepack enable
corepack prepare pnpm@9.12.0 --activate
pnpm -v
```

`pnpm -v` should print `9.12.0` or any version `>=9.0.0`. If it still prints an old Homebrew pnpm such as `7.13.2`, run commands through Corepack directly:

```bash
corepack pnpm test
```

```bash
corepack pnpm install
corepack pnpm dev
```

Or start the full local platform:

```bash
docker compose up -d --build
```

Default ports:

| Component | Port |
| --- | --- |
| Frontend | 3000 |
| API Gateway | 8080 |
| Auth Service | 4001 |
| Banking Service | 4002 |
| Chatbot Service | 4003 |
| AI Service | 4004 |
| RAG Service | 4005 |
| Ticket Service | 4006 |
| Notification Service | 4007 |
| Audit Service | 4008 |

Every service exposes `GET /health` and `GET /ready`.

## Workspace Commands

```bash
corepack pnpm build
corepack pnpm lint
corepack pnpm test
corepack pnpm typecheck
docker compose up -d --build
docker compose down
```

## Auth Service

The auth service lives at `backend/auth-service` and runs on port `4001`.

It uses:

- Express + Inversify
- PostgreSQL + Prisma
- bcrypt password hashing
- per-user `secretKey`
- role and permission tables
- Jest + Supertest tests

### Environment

Copy the service env example when running it outside Docker:

```bash
cp backend/auth-service/.env.example backend/auth-service/.env
```

Required values:

```text
PORT=4001
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:15432/auth_db
JWT_SECRET=replace-with-local-dev-secret
SERVICE_API_KEY=replace-with-local-service-api-key
BCRYPT_SALT_ROUNDS=12
```

### Install And Generate Prisma Client

Use the pinned local toolchain first:

```bash
nvm use
corepack enable
corepack prepare pnpm@9.12.0 --activate
corepack pnpm install
corepack pnpm --filter @ai-service-desk/auth-service prisma:generate
```

### Run With PostgreSQL

Start Postgres through Docker Compose:

```bash
docker compose up -d postgres redis
```

Apply the auth-service Prisma schema:

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:15432/auth_db \
corepack pnpm --filter @ai-service-desk/auth-service exec prisma migrate dev \
  --schema prisma/schema.prisma \
  --name init_auth_user_role_permission
```

Run only auth-service:

```bash
corepack pnpm --filter @ai-service-desk/auth-service dev
```

Health check:

```bash
curl http://localhost:4001/health
```

### Auth API Examples

Create user:

```bash
curl -X POST http://localhost:4001/api/users \
  -H "content-type: application/json" \
  -H "x-api-key: replace-with-local-service-api-key" \
  -d '{
    "email": "employee@nab-demo.local",
    "username": "employee@nab-demo.local",
    "password": "123456@abc",
    "firstName": "Demo",
    "lastName": "Employee",
    "phone": "123456789"
  }'
```

Login:

```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "content-type: application/json" \
  -d '{
    "email": "employee@nab-demo.local",
    "password": "123456@abc"
  }'
```

Read profile:

```bash
curl http://localhost:4001/api/users/profile \
  -H "authorization: Bearer <token>"
```

Change password:

```bash
curl -X POST http://localhost:4001/api/users/change-password \
  -H "content-type: application/json" \
  -H "authorization: Bearer <token>" \
  -d '{
    "password": "abcdef12345",
    "passwordConfirm": "abcdef12345"
  }'
```

### Run Tests

Auth-service tests run locally against Docker-backed infrastructure. The test command starts PostgreSQL and Redis through Docker Compose, applies Prisma migrations with `prisma migrate deploy`, and runs Jest + Supertest on the local machine.

Run the full workspace test suite:

```bash
nvm use
corepack pnpm test
```

Run only auth-service tests:

```bash
corepack pnpm --filter @ai-service-desk/auth-service test
```

The auth-service test command requires Docker to be running.

Docker PostgreSQL is published on host port `15432` to avoid conflicts with a local PostgreSQL running on `5432`.

Run typecheck for only auth-service:

```bash
corepack pnpm --filter @ai-service-desk/auth-service typecheck
```

## CI/CD And Azure

Azure DevOps pipeline starters live in `.azure-pipelines/`. The intended source strategy is GitHub for repository hosting and Azure DevOps for enterprise delivery governance, environments, approvals, service connections, and Key Vault-backed variable groups.

See:

- `docs/azure-deployment.md`
- `docs/azure-boards.md`
- `docs/security-observability.md`

## Interview Positioning

This project is a microservices monorepo: source code is centralized for developer productivity, while every backend domain owns its runtime, package manifest, Dockerfile, tests, configuration, and deployment unit.

The ticket service includes a DI-backed mock ServiceNow connector interface and Prisma schema starter so it can evolve from an in-memory demo provider to a database-backed provider without changing route contracts.
