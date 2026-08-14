import { Repository, DataSource } from 'typeorm';
import { Logger } from 'winston';
import { Transaction } from './Transaction';

/**
 * Input validation schema for creating a transaction
 */
interface CreateTransactionInput {
  userId: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, unknown>;
}

/**
 * TransactionService contains the business logic for transaction management.
 * Handles transaction creation, retrieval, and deletion with proper
 * organisation isolation and validation. Includes integrated data access layer.
 * 
 * AI-generated, unreviewed
 */
export class TransactionService {
  private repository: Repository<Transaction>;
  private logger: Logger;

  constructor(dataSource: DataSource, logger: Logger) {
    this.repository = dataSource.getRepository(Transaction);
    this.logger = logger;
  }

  /**
   * Creates a new transaction after validation.
   * Ensures organisation isolation and validates input parameters.
   * 
   * @param organisationId - ID of the organisation creating the transaction
   * @param input - Transaction creation input
   * @returns Promise resolving to the created Transaction
   * @throws Error if validation fails or database operation fails
   */
  async create(organisationId: string, input: CreateTransactionInput): Promise<Transaction> {
    // Validate input
    this.validateCreateInput(input);

    // Check that organisation ID is provided
    if (!organisationId || typeof organisationId !== 'string') {
      this.logger.error('Invalid organisation ID provided', { organisationId });
      throw new Error('Organisation ID is required and must be a string');
    }

    // Validate amount is positive
    if (input.amount <= 0) {
      this.logger.warn('Attempted to create transaction with non-positive amount', {
        organisationId,
        userId: input.userId,
        amount: input.amount,
      });
      throw new Error('Transaction amount must be positive');
    }

    try {
      const newTransaction = this.repository.create({
        organisationId,
        userId: input.userId,
        type: input.type,
        amount: input.amount,
        currency: input.currency,
        status: 'pending',
        description: input.description,
        metadata: input.metadata,
      });

      const savedTransaction = await this.repository.save(newTransaction);

      this.logger.info('Transaction created successfully', {
        transactionId: savedTransaction.id,
        organisationId,
        amount: savedTransaction.amount,
      });

      return savedTransaction;
    } catch (error) {
      this.logger.error('Failed to create transaction', {
        organisationId,
        userId: input.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Retrieves all transactions for a specific user within their organisation.
   * Implements multi-tenant data isolation.
   * 
   * @param organisationId - ID of the organisation
   * @param userId - ID of the user
   * @returns Promise resolving to array of user's transactions
   * @throws Error if parameters are invalid
   */
  async getByUser(organisationId: string, userId: string): Promise<Transaction[]> {
    // Validate organisation and user IDs
    if (!organisationId || typeof organisationId !== 'string') {
      throw new Error('Organisation ID is required and must be a string');
    }

    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required and must be a string');
    }

    try {
      const transactions = await this.repository.find({
        where: {
          organisationId,
          userId,
        },
        order: {
          createdAt: 'DESC',
        },
      });

      this.logger.debug('User transactions retrieved', {
        organisationId,
        userId,
        count: transactions.length,
      });

      return transactions;
    } catch (error) {
      this.logger.error('Failed to retrieve user transactions', {
        organisationId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Retrieves a single transaction by ID with organisation isolation check.
   * Ensures user can only access transactions within their organisation.
   * 
   * @param organisationId - ID of the organisation
   * @param transactionId - ID of the transaction to retrieve
   * @returns Promise resolving to Transaction or null if not found
   * @throws Error if parameters are invalid
   */
  async getById(organisationId: string, transactionId: string): Promise<Transaction | null> {
    if (!organisationId || typeof organisationId !== 'string') {
      throw new Error('Organisation ID is required and must be a string');
    }

    if (!transactionId || typeof transactionId !== 'string') {
      throw new Error('Transaction ID is required and must be a string');
    }

    try {
      const transaction = await this.repository.findOne({
        where: {
          id: transactionId,
          organisationId,
        },
      });

      return transaction || null;
    } catch (error) {
      this.logger.error('Failed to retrieve transaction', {
        organisationId,
        transactionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Deletes all transactions for a user within their organisation.
   * WARNING: This operation is destructive and irreversible.
   * 
   * @param organisationId - ID of the organisation
   * @param userId - ID of the user whose transactions should be deleted
   * @returns Promise resolving to number of deleted transactions
   * @throws Error if parameters are invalid or operation fails
   */
  async deleteAllByUser(organisationId: string, userId: string): Promise<number> {
    // Validate organisation and user IDs
    if (!organisationId || typeof organisationId !== 'string') {
      throw new Error('Organisation ID is required and must be a string');
    }

    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required and must be a string');
    }

    try {
      this.logger.warn('Deleting all transactions for user', {
        organisationId,
        userId,
      });

      const result = await this.repository.delete({
        organisationId,
        userId,
      });

      const deletedCount = result.affected || 0;

      this.logger.info('Transactions deleted', {
        organisationId,
        userId,
        deletedCount,
      });

      return deletedCount;
    } catch (error) {
      this.logger.error('Failed to delete user transactions', {
        organisationId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Validates the input data for transaction creation.
   * Ensures all required fields are present and have valid formats.
   * 
   * @param input - Transaction creation input to validate
   * @throws Error if validation fails
   */
  private validateCreateInput(input: CreateTransactionInput): void {
    const errors: string[] = [];

    if (!input.userId || typeof input.userId !== 'string') {
      errors.push('User ID is required and must be a string');
    }

    if (!input.type || typeof input.type !== 'string' || input.type.trim().length === 0) {
      errors.push('Transaction type is required and must be a non-empty string');
    }

    if (typeof input.amount !== 'number' || isNaN(input.amount)) {
      errors.push('Amount is required and must be a valid number');
    }

    if (!input.currency || typeof input.currency !== 'string' || input.currency.length !== 3) {
      errors.push('Currency code is required and must be a 3-character ISO 4217 code');
    }

    if (!input.description || typeof input.description !== 'string' || input.description.trim().length === 0) {
      errors.push('Description is required and must be a non-empty string');
    }

    if (input.metadata && typeof input.metadata !== 'object') {
      errors.push('Metadata must be a valid object');
    }

    if (errors.length > 0) {
      const errorMessage = errors.join('; ');
      this.logger.warn('Transaction creation validation failed', { errors });
      throw new Error(`Validation failed: ${errorMessage}`);
    }
  }
}
