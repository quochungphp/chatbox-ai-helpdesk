export type LogContext = Record<string, unknown>;

export type Logger = {
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
};

export function createLogger(serviceName: string): Logger {
  const write = (level: "info" | "warn" | "error", message: string, context: LogContext = {}) => {
    const payload = {
      level,
      serviceName,
      message,
      timestamp: new Date().toISOString(),
      ...context
    };

    const line = JSON.stringify(payload);

    if (level === "error") {
      console.error(line);
      return;
    }

    if (level === "warn") {
      console.warn(line);
      return;
    }

    console.log(line);
  };

  return {
    info: (message, context) => write("info", message, context),
    warn: (message, context) => write("warn", message, context),
    error: (message, context) => write("error", message, context)
  };
}

