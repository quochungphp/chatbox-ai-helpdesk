export type ServiceConfig = {
  serviceName: string;
  port: number;
  nodeEnv: string;
  logLevel: string;
};

export function getServiceConfig(serviceName: string, defaultPort: number): ServiceConfig {
  return {
    serviceName,
    port: Number(process.env.PORT ?? defaultPort),
    nodeEnv: process.env.NODE_ENV ?? "development",
    logLevel: process.env.LOG_LEVEL ?? "info"
  };
}

export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

