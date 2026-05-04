import { getSimulatorEnvironment } from "./config/environment.js";

/**
 * Checks local service health endpoints before running seed or e2e flows. The
 * retry loop gives dev servers a short startup window while still failing fast
 * enough when ba points the simulator at the wrong local port.
 */
async function main(): Promise<void> {
  const env = getSimulatorEnvironment();
  const retries = toPositiveInteger(process.env.SIMULATOR_HEALTH_RETRIES, 20);
  const delayMs = toPositiveInteger(process.env.SIMULATOR_HEALTH_DELAY_MS, 1_000);
  let unavailableServices: string[] = [];

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const results = await Promise.all(
      env.services.map(async (service) => {
        try {
          const response = await fetch(service.healthUrl, {
            headers: { accept: "application/json" },
            signal: AbortSignal.timeout(1_500)
          });

          return {
            name: service.name,
            ok: response.ok,
            status: response.ok ? "ok" : `failed:${response.status}`
          };
        } catch (error) {
          return {
            name: service.name,
            ok: false,
            status: `unavailable (${error instanceof Error ? error.message : String(error)})`
          };
        }
      })
    );

    unavailableServices = results.filter((result) => !result.ok).map((result) => result.name);

    if (unavailableServices.length === 0 || attempt === retries) {
      for (const result of results) {
        console.info(`${result.name}: ${result.status}`);
      }
    }

    if (unavailableServices.length === 0) {
      return;
    }

    if (attempt < retries) {
      await sleep(delayMs);
    }
  }

  throw new Error(`Local services are not ready: ${unavailableServices.join(", ")}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toPositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
