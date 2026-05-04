# Simulator

Local demo harness for the AI Service Desk microservices.

The simulator prepares databases, seeds NAB-style banking support demo data, and runs black-box e2e scenarios through the API Gateway.

## Prerequisites

```bash
cd /Users/hungle/Documents/Projects/chatbox-ai-helpdesk
nvm use
corepack pnpm install
```

Run a clean local demo from one terminal:

```bash
corepack pnpm demo:fresh
```

This stops the Docker Compose stack, removes compose data volumes, stops local
app processes on demo ports, starts infrastructure, applies migrations, starts
each app with a 3 second delay, seeds demo data, runs e2e verification, then
keeps the frontend and backend services running.

The default gateway URL is `http://localhost:8080`. Do not use
`SIMULATOR_API_BASE_URL=http://localhost:18080` unless API Gateway is actually
running on that port.

Open the demo frontend at:

```text
http://localhost:3000
```

## Commands

```bash
corepack pnpm simulator:migrate
corepack pnpm simulator:seed
corepack pnpm simulator:health
corepack pnpm simulator:e2e
corepack pnpm simulator:reset
corepack pnpm demo:data
corepack pnpm demo:fresh
corepack pnpm demo:verify
```

## Design

- `migrate` applies Prisma migrations per service database.
- `seed` uses public service APIs through API Gateway whenever possible.
- `e2e` validates realistic user journeys without importing service internals.
- Seed data uses `demo-bank.local` and mock banking application names. It is NAB-inspired for interview storytelling, not real NAB internal data.
