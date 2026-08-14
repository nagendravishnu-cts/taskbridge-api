import { Request, Response, Router } from 'express';
import { Logger } from 'winston';
import { AuditService } from '../services/AuditService';

export class AuditController {
  constructor(
    private readonly service: AuditService,
    private readonly logger: Logger,
  ) {}

  getRouter(): Router {
    const router = Router();

    router.post('/', this.recordAudit.bind(this));
    router.get('/:projectId', this.getAuditHistory.bind(this));

    return router;
  }

  private async recordAudit(req: Request, res: Response): Promise<void> {
    try {
      const entry = await this.service.recordAudit(req.body);
      res.status(201).json({ success: true, data: entry });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Audit controller record failed', { error: message });
      res.status(400).json({ success: false, error: message });
    }
  }

  private async getAuditHistory(req: Request, res: Response): Promise<void> {
    try {
      const organisationId = req.query.organisationId as string | undefined;
      const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
      const eventType = req.query.eventType as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      if (!organisationId) {
        throw new Error('Organisation ID is required');
      }

      const history = await this.service.getProjectHistory(organisationId, projectId, {
        eventType,
        startDate,
        endDate,
      });

      res.status(200).json({ success: true, data: history, count: history.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Audit controller history failed', { error: message });
      res.status(400).json({ success: false, error: message });
    }
  }
}
