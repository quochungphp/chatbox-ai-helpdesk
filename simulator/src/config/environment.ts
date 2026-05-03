export type SimulatorEnvironment = {
  apiBaseUrl: string;
  serviceApiKey: string;
  databases: {
    audit: string;
    auth: string;
    banking: string;
    notification: string;
    rag: string;
    ticket: string;
  };
  services: Array<{
    name: string;
    healthUrl: string;
  }>;
};

/**
 * Central simulator configuration. Defaults match local Docker Compose ports.
 */
export function getSimulatorEnvironment(): SimulatorEnvironment {
  return {
    apiBaseUrl: env("SIMULATOR_API_BASE_URL", "http://localhost:8080"),
    serviceApiKey: env("SERVICE_API_KEY", "local-service-api-key"),
    databases: {
      audit: env("AUDIT_DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:15432/audit_db"),
      auth: env("AUTH_DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:15432/auth_db"),
      banking: env("BANKING_DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:15432/banking_db"),
      notification: env("NOTIFICATION_DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:15432/notification_db"),
      rag: env("RAG_DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:15432/rag_db"),
      ticket: env("TICKET_DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:15432/ticket_db")
    },
    services: [
      service("api-gateway", env("API_GATEWAY_HEALTH_URL", "http://localhost:8080/health")),
      service("audit-service", env("AUDIT_SERVICE_HEALTH_URL", "http://localhost:4008/health")),
      service("auth-service", env("AUTH_SERVICE_HEALTH_URL", "http://localhost:4001/health")),
      service("ai-service", env("AI_SERVICE_HEALTH_URL", "http://localhost:4004/health")),
      service("banking-service", env("BANKING_SERVICE_HEALTH_URL", "http://localhost:4002/health")),
      service("rag-service", env("RAG_SERVICE_HEALTH_URL", "http://localhost:4005/health")),
      service("chatbot-service", env("CHATBOT_SERVICE_HEALTH_URL", "http://localhost:4003/health")),
      service("notification-service", env("NOTIFICATION_SERVICE_HEALTH_URL", "http://localhost:4007/health")),
      service("ticket-service", env("TICKET_SERVICE_HEALTH_URL", "http://localhost:4006/health"))
    ]
  };
}

function env(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

function service(name: string, healthUrl: string) {
  return { name, healthUrl };
}
