import { inject, injectable } from "inversify";
import { Prisma } from "../../generated/prisma-client/index.js";
import { TYPES } from "../bootstrap-type.js";
import { PrismaService } from "../services/prisma.service.js";
import type { Notification } from "../types/notification.type.js";
import type { CreateNotificationInput } from "../validators/notification.validator.js";

@injectable()
export class NotificationRepository {
  constructor(@inject(TYPES.PrismaService) private readonly prisma: PrismaService) {}

  async list(): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      orderBy: { createdAt: "desc" }
    });
    return notifications.map(toNotification);
  }

  async getById(id: string): Promise<Notification | null> {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    return notification ? toNotification(notification) : null;
  }

  async create(input: CreateNotificationInput & { id: string }): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: {
        id: input.id,
        channel: input.channel,
        recipient: input.recipient,
        subject: input.subject,
        message: input.message,
        status: "sent",
        metadata: input.metadata as Prisma.InputJsonObject | undefined
      }
    });
    return toNotification(notification);
  }
}

function toNotification(notification: {
  id: string;
  channel: string;
  recipient: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
  metadata: unknown;
}): Notification {
  return {
    id: notification.id,
    channel: notification.channel as Notification["channel"],
    recipient: notification.recipient,
    subject: notification.subject,
    message: notification.message,
    status: notification.status as Notification["status"],
    createdAt: notification.createdAt.toISOString(),
    metadata: notification.metadata && typeof notification.metadata === "object" ? (notification.metadata as Record<string, unknown>) : undefined
  };
}
