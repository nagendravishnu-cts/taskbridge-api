export interface Notification {
  id: string;
  recipientUserId: string;
  eventType: string;
  projectId: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}
