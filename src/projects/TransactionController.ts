import { Request, Response, Router } from 'express';
import { Logger } from 'winston';
import { TransactionService } from './TransactionService';

/**
 * HTTP controller for transaction routes.
 * Enforces the same organisation boundary checks used in the service layer.
 */
export class TransactionController {
  constructor(
    private readonly service: TransactionService,
    private readonly logger: Logger,
  ) {}

  getRouter(): Router {
    const router = Router();

    router.post('/', this.create.bind(this));
    router.get('/user/:userId', this.getByUser.bind(this));
    router.get('/:transactionId', this.getById.bind(this));
    router.delete('/user/:userId/all', this.deleteAllByUser.bind(this));

    return router;
  }

  private async create(req: Request, res: Response): Promise<void> {
    try {
      const organisationId = (req as Request & { organisationId?: string }).organisationId;
      const transaction = await this.service.create(organisationId ?? '', req.body);

      res.status(201).json({ success: true, data: transaction });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Transaction controller create failed', { error: message });
      res.status(400).json({ success: false, error: message });
    }
  }

  private async getByUser(req: Request, res: Response): Promise<void> {
    try {
      const organisationId = (req as Request & { organisationId?: string }).organisationId;
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      const transactions = await this.service.getByUser(organisationId ?? '', userId);

      res.status(200).json({ success: true, data: transactions, count: transactions.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Transaction controller user lookup failed', { error: message });
      res.status(400).json({ success: false, error: message });
    }
  }

  private async getById(req: Request, res: Response): Promise<void> {
    try {
      const organisationId = (req as Request & { organisationId?: string }).organisationId;
      const transactionId = Array.isArray(req.params.transactionId) ? req.params.transactionId[0] : req.params.transactionId;
      const transaction = await this.service.getById(organisationId ?? '', transactionId);

      if (!transaction) {
        res.status(404).json({ success: false, error: 'Transaction not found' });
        return;
      }

      res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Transaction controller lookup failed', { error: message });
      res.status(400).json({ success: false, error: message });
    }
  }

  private async deleteAllByUser(req: Request, res: Response): Promise<void> {
    try {
      const organisationId = (req as Request & { organisationId?: string }).organisationId;
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      const deletedCount = await this.service.deleteAllByUser(organisationId ?? '', userId);

      res.status(200).json({ success: true, deletedCount });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Transaction controller delete failed', { error: message });
      res.status(400).json({ success: false, error: message });
    }
  }
}
