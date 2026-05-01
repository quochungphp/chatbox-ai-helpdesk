import type { Application } from "express";
import { BootstrapApp } from "./bootstrap-app.js";

/**
 * Backward-compatible factory for tests and local tooling.
 */
export async function createApp(): Promise<Application> {
  const bootstrapApp = await new BootstrapApp().setup();
  return bootstrapApp.getServer();
}
