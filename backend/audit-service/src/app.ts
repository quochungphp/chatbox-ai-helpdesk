import type { Application } from "express";
import { BootstrapApp } from "./bootstrap-app.js";

export async function createApp(): Promise<Application> {
  const bootstrapApp = await new BootstrapApp().setup();
  return bootstrapApp.getServer();
}
