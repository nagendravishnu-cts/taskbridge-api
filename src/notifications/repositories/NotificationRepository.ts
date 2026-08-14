import { Notification } from '../models/Notification';

export class NotificationRepository {
  private readonly notifications: Notification[] = [];

  async create(notification: Notification): Promise<Notification> {
    this.notifications.push(notification);
    return notification;
  }

  async createMany(items: Notification[]): Promise<Notification[]> {
    this.notifications.push(...items);
    return items;
  }

  async findUnreadByUser(userId: string): Promise<Notification[]> {
    return this.notifications.filter(
      (notification) => notification.recipientUserId === userId && !notification.isRead,
    );
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const notification = this.notifications.find((item) => item.id === notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    return notification;
  }
}
