import { inject, injectable } from "inversify";
import { createId } from "@ai-service-desk/shared/utils";
import { TYPES } from "../bootstrap-type.js";
import { NotificationRepository } from "../repositories/notification.repository.js";
import type { Notification } from "../types/notification.type.js";
import type { CreateNotificationInput } from "../validators/notification.validator.js";

@injectable()
export class NotificationService {
  constructor(@inject(TYPES.NotificationRepository) private readonly repository: NotificationRepository) {}

  list(): Promise<Notification[]> {
    return this.repository.list();
  }

  getById(id: string): Promise<Notification | null> {
    return this.repository.getById(id);
  }

  send(input: CreateNotificationInput): Promise<Notification> {
    return this.repository.create({
      id: createId("ntf"),
      ...input
    });
  }
}
