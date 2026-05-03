import { ApiClient } from "../runtime/api-client.js";

export type Notification = {
  id: string;
  recipient: string;
  subject: string;
};

export class NotificationClient {
  constructor(private readonly apiClient: ApiClient) {}

  listNotifications() {
    return this.apiClient.request<Notification[]>("/api/notifications");
  }
}
