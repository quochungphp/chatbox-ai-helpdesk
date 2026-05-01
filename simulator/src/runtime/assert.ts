/**
 * Tiny assertion helper so e2e scenarios can fail fast without a test runner.
 */
export function assertScenario(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
