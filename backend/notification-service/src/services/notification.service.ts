import { injectable } from "inversify";
import { createId } from "@ai-service-desk/shared/utils";
import type { Notification } from "../types/notification.type.js";
import type { CreateNotificationInput } from "../validators/notification.validator.js";

@injectable()
export class NotificationService {
  private readonly notifications: Notification[] = [];

  list(): Notification[] {
    return this.notifications;
  }

  getById(id: string): Notification | null {
    return this.notifications.find((notification) => notification.id === id) ?? null;
  }

  send(input: CreateNotificationInput): Notification {
    const notification: Notification = {
      id: createId("ntf"),
      status: "sent",
      createdAt: new Date().toISOString(),
      ...input
    };

    this.notifications.unshift(notification);
    return notification;
  }
}
