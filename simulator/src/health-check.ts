import { getSimulatorEnvironment } from "./config/environment.js";

/**
 * Checks local service health endpoints before running seed or e2e flows.
 */
async function main(): Promise<void> {
  const env = getSimulatorEnvironment();

  for (const service of env.services) {
    try {
      const response = await fetch(service.healthUrl);
      const status = response.ok ? "ok" : `failed:${response.status}`;
      console.info(`${service.name}: ${status}`);
    } catch (error) {
      console.info(`${service.name}: unavailable (${error instanceof Error ? error.message : String(error)})`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
