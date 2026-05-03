/**
 * Verifies that the configured API Gateway is a JSON API before simulator
 * seed/e2e traffic starts. This catches accidental frontend ports early.
 */
export async function assertGatewayReady(apiBaseUrl: string): Promise<void> {
  try {
    const response = await fetch(`${apiBaseUrl}/health`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(2_000)
    });
    const contentType = response.headers.get("content-type") ?? "";

    if (response.ok && contentType.includes("application/json")) {
      return;
    }

    throw new Error(`status ${response.status}, content-type ${contentType || "unknown"}`);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `API Gateway is not ready at ${apiBaseUrl}. Start backend services first and use the gateway URL, usually http://localhost:8080. Detail: ${detail}`
    );
  }
}
