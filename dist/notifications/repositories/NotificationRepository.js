"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
class NotificationRepository {
    constructor() {
        this.notifications = [];
    }
    async create(notification) {
        this.notifications.push(notification);
        return notification;
    }
    async createMany(items) {
        this.notifications.push(...items);
        return items;
    }
    async findUnreadByUser(userId) {
        return this.notifications.filter((notification) => notification.recipientUserId === userId && !notification.isRead);
    }
    async markAsRead(notificationId) {
        const notification = this.notifications.find((item) => item.id === notificationId);
        if (!notification) {
            throw new Error('Notification not found');
        }
        notification.isRead = true;
        return notification;
    }
}
exports.NotificationRepository = NotificationRepository;
