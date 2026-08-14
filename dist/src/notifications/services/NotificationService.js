"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
class NotificationService {
    constructor(repository, logger) {
        this.repository = repository;
        this.logger = logger;
    }
    async notifyProjectMembers(input) {
        if (!input.projectId || !input.eventType || !input.message || !input.recipients.length) {
            throw new Error('Project ID, event type, message and recipients are required');
        }
        const notifications = input.recipients.map((recipientUserId) => ({
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
    async getUnreadNotifications(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }
        return this.repository.findUnreadByUser(userId);
    }
    async markNotificationAsRead(notificationId) {
        if (!notificationId) {
            throw new Error('Notification ID is required');
        }
        const updated = await this.repository.markAsRead(notificationId);
        this.logger.info('Notification marked as read', { notificationId });
        return updated;
    }
}
exports.NotificationService = NotificationService;
