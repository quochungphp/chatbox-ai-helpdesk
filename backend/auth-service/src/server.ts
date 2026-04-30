import "reflect-metadata";
import { BootstrapApp } from "./app.js";

const app = new BootstrapApp();
(async () => {
  (await app.setup()).init();
})();
