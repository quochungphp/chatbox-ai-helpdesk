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

```bash
pnpm install
pnpm dev
```

Or start the full local platform:

```bash
pnpm docker:up
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
pnpm build
pnpm lint
pnpm test
pnpm typecheck
pnpm docker:up
pnpm docker:down
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
