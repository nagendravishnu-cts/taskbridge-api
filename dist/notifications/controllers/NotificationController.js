"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const express_1 = require("express");
class NotificationController {
    constructor(service, logger) {
        this.service = service;
        this.logger = logger;
    }
    getRouter() {
        const router = (0, express_1.Router)();
        router.get('/:userId', this.getUnreadNotifications.bind(this));
        router.patch('/:id/read', this.markAsRead.bind(this));
        return router;
    }
    async getUnreadNotifications(req, res) {
        try {
            const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
            const notifications = await this.service.getUnreadNotifications(userId);
            res.status(200).json({ success: true, data: notifications, count: notifications.length });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Notification controller fetch failed', { error: message });
            res.status(400).json({ success: false, error: message });
        }
    }
    async markAsRead(req, res) {
        try {
            const notificationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const notification = await this.service.markNotificationAsRead(notificationId);
            res.status(200).json({ success: true, data: notification });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Notification controller read update failed', { error: message });
            res.status(400).json({ success: false, error: message });
        }
    }
}
exports.NotificationController = NotificationController;
