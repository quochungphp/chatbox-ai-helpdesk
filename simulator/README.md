# Simulator

Local demo harness for the AI Service Desk microservices.

The simulator prepares databases, seeds NAB-style banking support demo data, and runs black-box e2e scenarios through the API Gateway.

## Prerequisites

```bash
cd /Users/hungle/Documents/Projects/chatbox-ai-helpdesk
nvm use
corepack pnpm install
docker compose up -d postgres redis rabbitmq
```

Run services locally in another terminal when using seed/e2e through the gateway:

```bash
corepack pnpm dev:services
```

The default gateway URL is `http://localhost:8080`. Do not use
`SIMULATOR_API_BASE_URL=http://localhost:18080` unless API Gateway is actually
running on that port.

## Commands

```bash
corepack pnpm simulator:migrate
corepack pnpm simulator:seed
corepack pnpm simulator:health
corepack pnpm simulator:e2e
corepack pnpm simulator:reset
```

## Design

- `migrate` applies Prisma migrations per service database.
- `seed` uses public service APIs through API Gateway whenever possible.
- `e2e` validates realistic user journeys without importing service internals.
- Seed data uses `demo-bank.local` and mock banking application names. It is NAB-inspired for interview storytelling, not real NAB internal data.
