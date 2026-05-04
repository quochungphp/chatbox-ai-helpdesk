#!/usr/bin/env node
import { spawn } from "node:child_process";
import net from "node:net";

const root = new URL("..", import.meta.url).pathname;
const startDelayMs = positiveInteger(process.env.DEMO_START_DELAY_MS, 3_000);
const exitAfterVerify = process.env.DEMO_EXIT_AFTER_VERIFY === "1";
const children = [];
let isShuttingDown = false;

const appPorts = [3000, 4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 8080];
const apps = [
  ["auth-service", "@ai-service-desk/auth-service"],
  ["banking-service", "@ai-service-desk/banking-service"],
  ["ai-service", "@ai-service-desk/ai-service"],
  ["rag-service", "@ai-service-desk/rag-service"],
  ["ticket-service", "@ai-service-desk/ticket-service"],
  ["audit-service", "@ai-service-desk/audit-service"],
  ["notification-service", "@ai-service-desk/notification-service"],
  ["chatbot-service", "@ai-service-desk/chatbot-service"],
  ["api-gateway", "@ai-service-desk/api-gateway"],
  ["frontend", "@ai-service-desk/frontend"]
];

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  await shutdown(1);
}

async function main() {
  log("Stopping Docker Compose stack and removing service data volumes");
  await run("docker", ["compose", "down", "-v", "--remove-orphans"]);

  log("Stopping local app processes on demo ports");
  await killPorts(appPorts);

  log("Starting infrastructure: postgres, redis, rabbitmq");
  await run("docker", ["compose", "up", "-d", "postgres", "redis", "rabbitmq"]);
  await waitForPort(15432, "postgres");
  await waitForPort(6379, "redis");
  await waitForPort(5672, "rabbitmq");

  log("Applying fresh database migrations");
  await runWithRetry("corepack", ["pnpm", "simulator:migrate"], 10, 3_000);

  for (const [name, filter] of apps) {
    log(`Starting ${name}`);
    spawnApp(name, filter);
    await sleep(startDelayMs);
  }

  log("Waiting for local services to become healthy");
  await runWithRetry("corepack", ["pnpm", "simulator:health"], 3, 3_000);

  log("Seeding clean demo data");
  await runWithRetry("corepack", ["pnpm", "simulator:seed"], 3, 3_000);

  log("Running e2e verification");
  await runWithRetry("corepack", ["pnpm", "simulator:e2e"], 3, 3_000);

  log("Fresh local demo is ready");
  console.info("Frontend:    http://localhost:3000");
  console.info("API Gateway: http://localhost:8080");

  if (exitAfterVerify) {
    await shutdown(0);
    return;
  }

  await new Promise(() => undefined);
}

function spawnApp(name, filter) {
  const child = spawn("corepack", ["pnpm", "--filter", filter, "dev"], {
    cwd: root,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"]
  });

  child.stdout.on("data", (chunk) => {
    if (!isShuttingDown) {
      process.stdout.write(prefix(name, chunk));
    }
  });
  child.stderr.on("data", (chunk) => {
    if (!isShuttingDown) {
      process.stderr.write(prefix(name, chunk));
    }
  });
  child.on("exit", (code, signal) => {
    if (!isShuttingDown && code !== 0 && signal === null) {
      console.error(`[${name}] exited with code ${code}`);
    }
  });

  children.push(child);
}

async function run(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: process.env,
      stdio: "inherit"
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
    });
  });
}

async function runWithRetry(command, args, attempts, delayMs) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await run(command, args);
      return;
    } catch (error) {
      lastError = error;

      if (attempt === attempts) {
        break;
      }

      console.info(`[demo:fresh] ${command} ${args.join(" ")} failed, retrying in ${delayMs}ms (${attempt}/${attempts})`);
      await sleep(delayMs);
    }
  }

  throw lastError;
}

async function killPorts(ports) {
  const script = ports
    .map((port) => `pids=$(lsof -tiTCP:${port} -sTCP:LISTEN 2>/dev/null); [ -n "$pids" ] && kill $pids 2>/dev/null || true`)
    .join("\n");

  await run("zsh", ["-lc", script]);
}

async function waitForPort(port, name) {
  const timeoutMs = 30_000;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await canConnect(port)) {
      log(`${name} is reachable on port ${port}`);
      return;
    }

    await sleep(1_000);
  }

  throw new Error(`${name} did not become reachable on port ${port}`);
}

function canConnect(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    socket.setTimeout(1_000);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function shutdown(code = 0) {
  isShuttingDown = true;

  for (const child of children.reverse()) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  await sleep(500);
  process.exit(typeof code === "number" ? code : 0);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function prefix(name, chunk) {
  return String(chunk)
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => `[${name}] ${line}\n`)
    .join("");
}

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function log(message) {
  console.info(`\n[demo:fresh] ${message}`);
}
