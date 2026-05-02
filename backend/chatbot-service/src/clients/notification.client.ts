export type NotificationInput = {
  channel: "email" | "teams" | "slack";
  recipient: string;
  subject: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export class NotificationClient {
  constructor(private readonly baseUrl = process.env.NOTIFICATION_SERVICE_URL ?? "http://localhost:4007") {}

  async send(input: NotificationInput): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/notifications`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input)
      });
    } catch {
      // Notification must not block chatbot response.
    }
  }
}
