import { DataSource, IsNull, Repository } from 'typeorm';
import { Logger } from 'winston';
import { Transaction } from './Transaction';

/**
 * Repository for transaction persistence and retrieval.
 * Every query MUST be scoped by organisationId to enforce multi-tenant isolation.
 */
export class TransactionRepository {
  private readonly repository: Repository<Transaction>;
  private readonly logger: Logger;

  constructor(dataSource: DataSource, logger: Logger) {
    this.repository = dataSource.getRepository(Transaction);
    this.logger = logger;
  }

  async create(organisationId: string, input: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.repository.create({
      ...input,
      organisationId,
      status: input.status ?? 'pending',
    });

    const saved = await this.repository.save(transaction);

    this.logger.info('Transaction created', {
      organisationId,
      transactionId: saved.id,
      userId: saved.userId,
      amount: saved.amount,
      status: saved.status,
    });

    return saved;
  }

  async getByUser(organisationId: string, userId: string): Promise<Transaction[]> {
    return this.repository.find({
      where: {
        organisationId,
        userId,
        deletedAt: IsNull(),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getById(organisationId: string, transactionId: string): Promise<Transaction | null> {
    return this.repository.findOne({
      where: {
        id: transactionId,
        organisationId,
        deletedAt: IsNull(),
      },
    });
  }

  async deleteAllByUser(organisationId: string, userId: string): Promise<number> {
    const result = await this.repository.update(
      {
        organisationId,
        userId,
        deletedAt: IsNull(),
      },
      {
        deletedAt: new Date(),
      },
    );

    this.logger.warn('Soft-deleted transactions for user', {
      organisationId,
      userId,
      affectedRows: result.affected ?? 0,
    });

    return result.affected ?? 0;
  }
}
