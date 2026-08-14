import { Request, Response, Router } from 'express';
import { Logger } from 'winston';
import { NotificationService } from '../services/NotificationService';

export class NotificationController {
  constructor(
    private readonly service: NotificationService,
    private readonly logger: Logger,
  ) {}

  getRouter(): Router {
    const router = Router();

    router.get('/:userId', this.getUnreadNotifications.bind(this));
    router.patch('/:id/read', this.markAsRead.bind(this));

    return router;
  }

  private async getUnreadNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      const notifications = await this.service.getUnreadNotifications(userId);

      res.status(200).json({ success: true, data: notifications, count: notifications.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Notification controller fetch failed', { error: message });
      res.status(400).json({ success: false, error: message });
    }
  }

  private async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const notificationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const notification = await this.service.markNotificationAsRead(notificationId);

      res.status(200).json({ success: true, data: notification });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Notification controller read update failed', { error: message });
      res.status(400).json({ success: false, error: message });
    }
  }
}
