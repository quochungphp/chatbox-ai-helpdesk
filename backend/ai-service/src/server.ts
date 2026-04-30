import { getServiceConfig } from "@ai-service-desk/shared/config";
import { createLogger } from "@ai-service-desk/shared/logger";
import { createApp } from "./app.js";

const config = getServiceConfig("ai-service", 4004);
const logger = createLogger(config.serviceName);

createApp().listen(config.port, () => {
  logger.info("service_started", { port: config.port, nodeEnv: config.nodeEnv });
});

