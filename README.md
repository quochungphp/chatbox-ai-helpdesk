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

## API Gateway

For local development, run infrastructure in Docker and run services with `pnpm dev`.

Install dependencies first:

```bash
nvm use
corepack pnpm install
```

Start local infrastructure:

```bash
docker compose up -d postgres redis
```

Run auth-service locally:

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:15432/auth_db \
JWT_SECRET=local-dev-secret \
SERVICE_API_KEY=local-service-api-key \
corepack pnpm --filter @ai-service-desk/auth-service dev
```

Run api-gateway locally:

```bash
AUTH_SERVICE_URL=http://localhost:4001 \
REDIS_URL=redis://127.0.0.1:6379 \
RATE_LIMIT_MAX_REQUESTS=120 \
RATE_LIMIT_WINDOW_MS=60000 \
corepack pnpm --filter @ai-service-desk/api-gateway dev
```

Smoke test through the gateway:

```bash
curl http://127.0.0.1:8080/health
curl http://127.0.0.1:8080/api
```

Create a user through the gateway:

```bash
curl -X POST http://127.0.0.1:8080/api/users \
  -H "content-type: application/json" \
  -H "x-api-key: local-service-api-key" \
  -d '{
    "email": "gateway-demo@nab-demo.local",
    "username": "gateway-demo@nab-demo.local",
    "password": "123456@abc",
    "firstName": "Gateway",
    "lastName": "Demo",
    "phone": "123456789"
  }'
```

Run API Gateway unit tests:

```bash
corepack pnpm --filter @ai-service-desk/api-gateway test
```

Run API Gateway test typecheck:

```bash
corepack pnpm --filter @ai-service-desk/api-gateway exec tsc --noEmit -p tsconfig.spec.json
```

The API Gateway unit tests use Supertest and a mock auth-service server. They do not require Docker or real Redis.

## Chatbot Service

Run chatbot-service locally:

```bash
corepack pnpm --filter @ai-service-desk/chatbot-service dev
```

Send a message directly to chatbot-service:

```bash
curl -X POST http://127.0.0.1:4003/api/chat/message \
  -H "content-type: application/json" \
  -d '{
    "userId": "usr_demo",
    "message": "VPN is not working and shows error connection timeout"
  }'
```

Send a message through API Gateway when both services are running:

```bash
curl -X POST http://127.0.0.1:8080/api/chat/message \
  -H "content-type: application/json" \
  -d '{
    "userId": "usr_demo",
    "message": "I need access to the payment system urgently"
  }'
```

Run chatbot-service typecheck:

```bash
corepack pnpm --filter @ai-service-desk/chatbot-service typecheck
```

Chatbot behavior:

- Searches RAG Service for grounded support context.
- Calls AI Service to generate the final grounded answer.
- Creates a ticket through Ticket Service when the request is urgent, unknown, or explicitly asks for escalation.
- Returns `sources` and `ticket` in the chat response when available.

## AI Service

AI Service exposes provider-backed GenAI endpoints:

```text
POST /api/ai/classify-intent
POST /api/ai/extract-entities
POST /api/ai/generate-answer
```

Local development works without an AI key through the deterministic fallback provider. To use Azure OpenAI, set:

```bash
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_DEPLOYMENT=
```

Run locally:

```bash
corepack pnpm --filter @ai-service-desk/ai-service dev
```

## Banking Service

Banking Service provides seeded enterprise banking context from `banking_db`:

```text
GET  /api/banking/employees/:userId
GET  /api/banking/applications
POST /api/banking/access/check
```

Run locally:

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:15432/banking_db \
corepack pnpm --filter @ai-service-desk/banking-service dev
```

## Ticket Service

Ticket Service stores ServiceNow-style tickets in `ticket_db` through Prisma.

Apply migrations:

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:15432/ticket_db \
corepack pnpm --filter @ai-service-desk/ticket-service exec prisma migrate deploy \
  --schema prisma/schema.prisma
```

Run ticket-service locally:

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:15432/ticket_db \
corepack pnpm --filter @ai-service-desk/ticket-service dev
```

## RAG Service

Start PostgreSQL and apply RAG migrations:

```bash
docker compose up -d postgres
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:15432/rag_db \
corepack pnpm --filter @ai-service-desk/rag-service exec prisma migrate deploy \
  --schema prisma/schema.prisma
```

Run rag-service locally:

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:15432/rag_db \
corepack pnpm --filter @ai-service-desk/rag-service dev
```

Create a knowledge document:

```bash
curl -X POST http://127.0.0.1:4005/api/kb/articles \
  -H "content-type: application/json" \
  -d '{
    "title": "VPN troubleshooting guide",
    "source": "internal-it/vpn",
    "content": "When VPN is not working, confirm internet connectivity, restart the VPN client, verify MFA approval, check the enterprise profile, and capture the exact connection timeout error before escalation."
  }'
```

Search knowledge chunks:

```bash
curl -X POST http://127.0.0.1:4005/api/kb/search \
  -H "content-type: application/json" \
  -d '{
    "query": "vpn connection timeout mfa",
    "limit": 3
  }'
```

Run rag-service typecheck:

```bash
corepack pnpm --filter @ai-service-desk/rag-service typecheck
```

## Simulator

The simulator is a local demo harness for migration, NAB-style seed data, health checks, and black-box e2e scenarios through API Gateway.

Prepare infrastructure and apply service migrations:

```bash
docker compose up -d postgres redis rabbitmq
corepack pnpm simulator:migrate
```

Run the services needed by seed/e2e:

```bash
corepack pnpm dev:services
```

The simulator uses API Gateway at `http://localhost:8080` by default. Only set
`SIMULATOR_API_BASE_URL` when the gateway is intentionally running on another
port.

## Audit Service

Audit Service stores audit events in `audit_db` with Prisma and uses the same Inversify bootstrap structure as auth-service.

```text
GET  /api/admin/metrics
GET  /api/admin/audit-logs
POST /api/admin/audit-logs
```

Apply migrations:

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:15432/audit_db \
corepack pnpm --filter @ai-service-desk/audit-service exec prisma migrate deploy \
  --schema prisma/schema.prisma
```

Run locally:

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:15432/audit_db \
corepack pnpm --filter @ai-service-desk/audit-service dev
```

## Notification Service

Notification Service persists local email/Teams/Slack notification records in `notification_db`.

```text
GET  /api/notifications
GET  /api/notifications/:id
POST /api/notifications
```

Run locally:

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:15432/notification_db \
corepack pnpm --filter @ai-service-desk/notification-service dev
```

In another terminal:

```bash
corepack pnpm simulator:seed
corepack pnpm simulator:health
corepack pnpm simulator:e2e
```

Reset simulator-managed databases when ba wants a clean demo:

```bash
corepack pnpm simulator:reset
```

Seed data uses `demo-bank.local` users, mock banking departments/applications, workplace support knowledge articles, and ServiceNow-style tickets. It is NAB-inspired for interview storytelling and does not use real NAB internal data.

## Frontend Demo

Run the React demo after API Gateway and backend services are running:

```bash
VITE_API_BASE_URL=http://localhost:8080 \
corepack pnpm --filter @ai-service-desk/frontend dev
```

Open:

```text
http://localhost:3000
```

Good demo prompt:

```text
I need access to Payments Operations Console
```

Expected flow:

```text
Chatbot -> Banking policy check -> RAG -> AI answer -> Ticket -> Audit -> Notification
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
