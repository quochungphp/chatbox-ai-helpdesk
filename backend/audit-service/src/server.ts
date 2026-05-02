import { BootstrapApp } from "./bootstrap-app.js";

const bootstrapApp = await new BootstrapApp().setup();
bootstrapApp.init();
