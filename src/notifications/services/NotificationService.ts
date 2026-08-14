import { Logger } from 'winston';
import { Notification } from '../models/Notification';
import { NotificationRepository } from '../repositories/NotificationRepository';

export interface NotifyProjectMembersInput {
  projectId: string;
  eventType: string;
  message: string;
  recipients: string[];
}

export class NotificationService {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly logger: Logger,
  ) {}

  async notifyProjectMembers(input: NotifyProjectMembersInput): Promise<Notification[]> {
    if (!input.projectId || !input.eventType || !input.message || !input.recipients.length) {
      throw new Error('Project ID, event type, message and recipients are required');
    }

    const notifications: Notification[] = input.recipients.map((recipientUserId) => ({
      id: `notification-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      recipientUserId,
      eventType: input.eventType,
      projectId: input.projectId,
      message: input.message,
      isRead: false,
      createdAt: new Date(),
    }));

    const created = await this.repository.createMany(notifications);

    this.logger.info('Project notifications created', {
      projectId: input.projectId,
      eventType: input.eventType,
      recipientCount: created.length,
    });

    return created;
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return this.repository.findUnreadByUser(userId);
  }

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }

    const updated = await this.repository.markAsRead(notificationId);

    this.logger.info('Notification marked as read', { notificationId });
    return updated;
  }
}
