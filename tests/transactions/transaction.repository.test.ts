import { TransactionRepository } from '../../src/transactions/repositories/TransactionRepository';
import { Transaction } from '../../src/transactions/models/Transaction';
import { DataSource, Repository } from 'typeorm';
import { Logger } from 'winston';

/**
 * Test suite for TransactionRepository
 * Tests data access layer including:
 * - Transaction creation and persistence
 * - Multi-tenant organisation isolation
 * - User-based transaction retrieval
 * - Transaction deletion
 * - Status updates
 * - Query filtering and ordering
 */
describe('TransactionRepository', () => {
  let repository: TransactionRepository;
  let mockDataSource: Partial<DataSource>;
  let mockTypeOrmRepository: any;
  let mockLogger: Partial<Logger>;

  const organisationId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const transactionId = '550e8400-e29b-41d4-a716-446655440002';

  beforeEach(() => {
    // Mock TypeORM repository
    mockTypeOrmRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    // Mock DataSource
    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockTypeOrmRepository),
    };

    // Mock Logger
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    repository = new TransactionRepository(
      mockDataSource as any,
      mockLogger as any
    );
  });

  describe('create', () => {
    it('should create and save a transaction with organisation ID', async () => {
      const transactionData = {
        userId,
        type: 'payment',
        amount: 100.5,
        currency: 'USD',
        status: 'pending' as const,
        description: 'Test payment',
      };

      const savedTransaction: Transaction = {
        id: transactionId,
        organisationId,
        ...transactionData,
        metadata: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTypeOrmRepository.create.mockReturnValue(transactionData);
      mockTypeOrmRepository.save.mockResolvedValue(savedTransaction);

      const result = await repository.create(organisationId, transactionData);

      expect(result).toEqual(savedTransaction);
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith({
        ...transactionData,
        organisationId,
      });
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Transaction created',
        expect.objectContaining({
          organisationId,
          type: 'payment',
          amount: 100.5,
        })
      );
    });

    it('should include metadata when provided', async () => {
      const transactionData = {
        userId,
        type: 'payment',
        amount: 100,
        currency: 'USD',
        status: 'pending' as const,
        description: 'Test',
        metadata: { reference: 'REF-123' },
      };

      mockTypeOrmRepository.create.mockReturnValue(transactionData);
      mockTypeOrmRepository.save.mockResolvedValue({
        id: transactionId,
        organisationId,
        ...transactionData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(organisationId, transactionData);

      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { reference: 'REF-123' },
        })
      );
    });
  });

  describe('getByUser', () => {
    it('should retrieve transactions for a user with organisation isolation', async () => {
      const mockTransactions: Transaction[] = [
        {
          id: transactionId,
          organisationId,
          userId,
          type: 'payment',
          amount: 100,
          currency: 'USD',
          status: 'completed',
          description: 'Payment 1',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          organisationId,
          userId,
          type: 'refund',
          amount: 50,
          currency: 'USD',
          status: 'completed',
          description: 'Refund 1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockTypeOrmRepository.find.mockResolvedValue(mockTransactions);

      const result = await repository.getByUser(organisationId, userId);

      expect(result).toEqual(mockTransactions);
      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: {
          organisationId,
          userId,
        },
        order: {
          createdAt: 'DESC',
        },
      });
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Transactions retrieved for user',
        expect.objectContaining({
          organisationId,
          userId,
          count: 2,
        })
      );
    });

    it('should return empty array for user with no transactions', async () => {
      mockTypeOrmRepository.find.mockResolvedValue([]);

      const result = await repository.getByUser(organisationId, userId);

      expect(result).toEqual([]);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Transactions retrieved for user',
        expect.objectContaining({ count: 0 })
      );
    });

    it('should sort transactions in descending order by creation date', async () => {
      mockTypeOrmRepository.find.mockResolvedValue([]);

      await repository.getByUser(organisationId, userId);

      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { createdAt: 'DESC' },
        })
      );
    });

    it('should enforce organisation isolation in queries', async () => {
      mockTypeOrmRepository.find.mockResolvedValue([]);

      const otherOrgId = '550e8400-e29b-41d4-a716-446655440099';
      await repository.getByUser(otherOrgId, userId);

      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            organisationId: otherOrgId,
            userId,
          },
        })
      );
    });
  });

  describe('getById', () => {
    it('should retrieve a transaction by ID with organisation isolation', async () => {
      const mockTransaction: Transaction = {
        id: transactionId,
        organisationId,
        userId,
        type: 'payment',
        amount: 100,
        currency: 'USD',
        status: 'completed',
        description: 'Payment',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTypeOrmRepository.findOne.mockResolvedValue(mockTransaction);

      const result = await repository.getById(organisationId, transactionId);

      expect(result).toEqual(mockTransaction);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: transactionId,
          organisationId,
        },
      });
    });

    it('should return null for non-existent transaction', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.getById(organisationId, 'non-existent');

      expect(result).toBeNull();
    });

    it('should enforce organisation isolation', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const otherOrgId = '550e8400-e29b-41d4-a716-446655440099';
      await repository.getById(otherOrgId, transactionId);

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            organisationId: otherOrgId,
            id: transactionId,
          },
        })
      );
    });
  });

  describe('deleteByUser', () => {
    it('should delete all transactions for a user', async () => {
      const deleteResult = { affected: 3 };
      mockTypeOrmRepository.delete.mockResolvedValue(deleteResult);

      const result = await repository.deleteByUser(organisationId, userId);

      expect(result).toBe(3);
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith({
        organisationId,
        userId,
      });
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Transactions deleted for user',
        expect.objectContaining({
          organisationId,
          userId,
          deletedCount: 3,
        })
      );
    });

    it('should return 0 when no transactions deleted', async () => {
      mockTypeOrmRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await repository.deleteByUser(organisationId, userId);

      expect(result).toBe(0);
    });

    it('should return 0 when affected is null', async () => {
      mockTypeOrmRepository.delete.mockResolvedValue({ affected: null });

      const result = await repository.deleteByUser(organisationId, userId);

      expect(result).toBe(0);
    });

    it('should enforce organisation isolation', async () => {
      mockTypeOrmRepository.delete.mockResolvedValue({ affected: 0 });

      const otherOrgId = '550e8400-e29b-41d4-a716-446655440099';
      await repository.deleteByUser(otherOrgId, userId);

      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith({
        organisationId: otherOrgId,
        userId,
      });
    });
  });

  describe('getByOrganisation', () => {
    it('should retrieve transactions for an organisation with pagination', async () => {
      const mockTransactions: Transaction[] = [
        {
          id: transactionId,
          organisationId,
          userId,
          type: 'payment',
          amount: 100,
          currency: 'USD',
          status: 'completed',
          description: 'Payment',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockTypeOrmRepository.find.mockResolvedValue(mockTransactions);

      const result = await repository.getByOrganisation(organisationId, 50, 10);

      expect(result).toEqual(mockTransactions);
      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: { organisationId },
        order: { createdAt: 'DESC' },
        take: 50,
        skip: 10,
      });
    });

    it('should use default pagination values', async () => {
      mockTypeOrmRepository.find.mockResolvedValue([]);

      await repository.getByOrganisation(organisationId);

      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
          skip: 0,
        })
      );
    });
  });

  describe('updateStatus', () => {
    it('should update transaction status', async () => {
      const originalTransaction: Transaction = {
        id: transactionId,
        organisationId,
        userId,
        type: 'payment',
        amount: 100,
        currency: 'USD',
        status: 'pending',
        description: 'Payment',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTransaction: Transaction = {
        ...originalTransaction,
        status: 'completed',
      };

      mockTypeOrmRepository.findOne.mockResolvedValue(originalTransaction);
      mockTypeOrmRepository.save.mockResolvedValue(updatedTransaction);

      const result = await repository.updateStatus(
        organisationId,
        transactionId,
        'completed'
      );

      expect(result).toEqual(updatedTransaction);
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Transaction status updated',
        expect.objectContaining({
          transactionId,
          organisationId,
          newStatus: 'completed',
        })
      );
    });

    it('should return null for non-existent transaction', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.updateStatus(
        organisationId,
        'non-existent',
        'completed'
      );

      expect(result).toBeNull();
      expect(mockTypeOrmRepository.save).not.toHaveBeenCalled();
    });
  });
});
