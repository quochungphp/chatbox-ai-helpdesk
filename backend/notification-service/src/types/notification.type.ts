export type NotificationChannel = "email" | "teams" | "slack";

export type NotificationStatus = "queued" | "sent";

export type Notification = {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  message: string;
  status: NotificationStatus;
  createdAt: string;
  metadata?: Record<string, unknown>;
};
