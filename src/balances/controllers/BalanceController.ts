import { Request, Response, Router } from 'express';
import { Logger } from 'winston';
import { BalanceService } from '../services/BalanceService';

export class BalanceController {
  constructor(
    private readonly service: BalanceService,
    private readonly logger: Logger,
  ) {}

  getRouter(): Router {
    const router = Router();

    router.get('/project/:projectId', this.getProjectBalance.bind(this));
    router.get('/user/:userId', this.getUserBalance.bind(this));
    router.post('/recalculate', this.recalculate.bind(this));

    return router;
  }

  private async getProjectBalance(req: Request, res: Response): Promise<void> {
    try {
      const organisationId = (req as Request & { organisationId?: string }).organisationId ?? '';
      const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
      const entries = await (this.service as any).repository.getEntriesByProject(projectId, organisationId);
      const result = { projectId, organisationId, balances: entries };

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Balance controller project lookup failed', { error: message });
      res.status(400).json({ success: false, error: message });
    }
  }

  private async getUserBalance(req: Request, res: Response): Promise<void> {
    try {
      const organisationId = (req as Request & { organisationId?: string }).organisationId ?? '';
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      const entries = await (this.service as any).repository.getEntriesByProject(userId, organisationId);
      const result = { userId, organisationId, balances: entries };

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Balance controller user lookup failed', { error: message });
      res.status(400).json({ success: false, error: message });
    }
  }

  private async recalculate(req: Request, res: Response): Promise<void> {
    try {
      const snapshot = await this.service.recalculateProjectBalance({
        organisationId: req.body.organisationId,
        projectId: req.body.projectId,
        userId: req.body.userId,
        eventType: req.body.eventType,
        reason: req.body.reason,
      });

      res.status(200).json({ success: true, data: snapshot });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Balance controller recalc failed', { error: message });
      res.status(400).json({ success: false, error: message });
    }
  }
}
