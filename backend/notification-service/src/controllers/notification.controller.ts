import { inject } from "inversify";
import { BaseHttpController, controller, httpGet, httpPost, request, requestParam, response } from "inversify-express-utils";
import type { Request, Response } from "express";
import { failure, success } from "@ai-service-desk/shared/utils";
import { TYPES } from "../bootstrap-type.js";
import { NotificationService } from "../services/notification.service.js";
import { createNotificationSchema } from "../validators/notification.validator.js";

@controller("/api/notifications")
export class NotificationController extends BaseHttpController {
  constructor(@inject(TYPES.NotificationService) private readonly notificationService: NotificationService) {
    super();
  }

  @httpGet("/")
  list(@response() res: Response): Response {
    return res.json(success(this.notificationService.list()));
  }

  @httpGet("/:id")
  getById(@requestParam("id") id: string, @response() res: Response): Response {
    const notification = this.notificationService.getById(id);

    if (!notification) {
      return res.status(404).json(failure("NOTIFICATION_NOT_FOUND", "Notification not found"));
    }

    return res.json(success(notification));
  }

  @httpPost("/")
  send(@request() req: Request, @response() res: Response): Response {
    const input = createNotificationSchema.safeParse(req.body);

    if (!input.success) {
      return res.status(400).json(failure("VALIDATION_ERROR", "Invalid notification input", input.error.flatten()));
    }

    return res.status(202).json(success(this.notificationService.send(input.data)));
  }
}
