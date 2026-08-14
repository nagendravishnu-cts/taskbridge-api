import { Request, Response, Router } from 'express';
import { Logger } from 'winston';
import { ExpenseService } from '../services/ExpenseService';

export class ExpenseController {
  constructor(
    private readonly service: ExpenseService,
    private readonly logger: Logger,
  ) {}

  getRouter(): Router {
    const router = Router();

    router.post('/', this.create.bind(this));
    router.get('/project/:projectId', this.getByProject.bind(this));

    return router;
  }

  private async create(req: Request, res: Response): Promise<void> {
    try {
      const organisationId = (req as Request & { organisationId?: string }).organisationId ?? '';
      const input = {
        ...req.body,
        organisationId,
      };

      const expense = await this.service.createExpense(input);
      res.status(201).json({ success: true, data: expense });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Expense controller create failed', { error: message });
      res.status(400).json({ success: false, error: message });
    }
  }

  private async getByProject(req: Request, res: Response): Promise<void> {
    try {
      const organisationId = (req as Request & { organisationId?: string }).organisationId ?? '';
      const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
      const repository = (this.service as any).repository as { findByProjectId: (projectId: string, organisationId: string) => Promise<any[]> };
      const expenses = await repository.findByProjectId(projectId, organisationId);

      res.status(200).json({ success: true, data: expenses, count: expenses.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Expense controller project lookup failed', { error: message });
      res.status(400).json({ success: false, error: message });
    }
  }
}
