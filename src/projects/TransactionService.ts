import { Logger } from 'winston';
import { z } from 'zod';
import { TransactionRepository } from './TransactionRepository';
import { Transaction } from './Transaction';
import {
  createTransactionSchema,
  deleteAllByUserSchema,
  getByUserSchema,
  transactionIdSchema,
  type CreateTransactionInput,
} from './transaction.validation';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from './errors';

/**
 * Service responsible for transaction business rules.
 * It does not access the database directly; all persistence is delegated to the repository.
 */
export class TransactionService {
  constructor(
    private readonly repository: TransactionRepository,
    private readonly logger: Logger,
    private readonly userMembershipChecker?: (organisationId: string, userId: string) => Promise<boolean>,
  ) {}

  /**
   * Creates a transaction for a user within an organisation.
   */
  async create(organisationId: string, input: unknown): Promise<Transaction> {
    this.ensureOrganisationId(organisationId);

    const parsedInput = createTransactionSchema.parse(input) as CreateTransactionInput;
    await this.ensureUserBelongsToOrganisation(organisationId, parsedInput.userId);

    try {
      const transaction = await this.repository.create(organisationId, parsedInput);

      this.logAudit('transaction_created', {
        organisationId,
        userId: parsedInput.userId,
        transactionId: transaction.id,
        amount: transaction.amount,
      });

      return transaction;
    } catch (error) {
      this.logger.error('Transaction creation failed', {
        organisationId,
        userId: parsedInput.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Returns all active transactions for a user within a single organisation.
   */
  async getByUser(organisationId: string, userId: string): Promise<Transaction[]> {
    this.ensureOrganisationId(organisationId);
    const parsed = getByUserSchema.parse({ organisationId, userId });

    await this.ensureUserBelongsToOrganisation(parsed.organisationId, parsed.userId);

    try {
      const transactions = await this.repository.getByUser(parsed.organisationId, parsed.userId);

      this.logger.info('Transactions retrieved for user', {
        organisationId: parsed.organisationId,
        userId: parsed.userId,
        count: transactions.length,
      });

      return transactions;
    } catch (error) {
      this.logger.error('User transaction retrieval failed', {
        organisationId: parsed.organisationId,
        userId: parsed.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Returns a transaction by ID only if it falls under the caller's organisation.
   */
  async getById(organisationId: string, transactionId: string): Promise<Transaction | null> {
    this.ensureOrganisationId(organisationId);
    const parsed = transactionIdSchema.parse({ organisationId, transactionId });

    try {
      const transaction = await this.repository.getById(parsed.organisationId, parsed.transactionId);

      if (!transaction) {
        throw new NotFoundError('Transaction not found');
      }

      return transaction;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      this.logger.error('Transaction lookup failed', {
        organisationId: parsed.organisationId,
        transactionId: parsed.transactionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Soft-deletes all active transactions for a user within an organisation.
   */
  async deleteAllByUser(organisationId: string, userId: string): Promise<number> {
    this.ensureOrganisationId(organisationId);
    const parsed = deleteAllByUserSchema.parse({ organisationId, userId });

    await this.ensureUserBelongsToOrganisation(parsed.organisationId, parsed.userId);

    try {
      const deletedCount = await this.repository.deleteAllByUser(parsed.organisationId, parsed.userId);

      this.logAudit('transactions_deleted', {
        organisationId: parsed.organisationId,
        userId: parsed.userId,
        deletedCount,
      });

      return deletedCount;
    } catch (error) {
      this.logger.error('Bulk transaction delete failed', {
        organisationId: parsed.organisationId,
        userId: parsed.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private ensureOrganisationId(organisationId: string): void {
    if (!organisationId || typeof organisationId !== 'string') {
      throw new ValidationError('Organisation ID is required and must be a string');
    }
  }

  private async ensureUserBelongsToOrganisation(organisationId: string, userId: string): Promise<void> {
    if (!this.userMembershipChecker) {
      return;
    }

    const isAllowed = await this.userMembershipChecker(organisationId, userId);

    if (!isAllowed) {
      throw new ForbiddenError('User does not belong to this organisation');
    }
  }

  private logAudit(action: string, details: Record<string, unknown>): void {
    this.logger.warn(action, {
      ...details,
      timestamp: new Date().toISOString(),
    });
  }
}
