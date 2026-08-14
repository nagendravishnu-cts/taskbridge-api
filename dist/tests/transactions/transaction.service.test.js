"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TransactionService_1 = require("../services/TransactionService");
/**
 * Test suite for TransactionService
 * Tests business logic including:
 * - Transaction creation with validation
 * - Organisation isolation
 * - User transaction retrieval
 * - Transaction deletion
 * - Error handling
 */
describe('TransactionService', () => {
    let service;
    let repository;
    let mockDataSource;
    let mockLogger;
    let mockRepository;
    const organisationId = '550e8400-e29b-41d4-a716-446655440000';
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const transactionId = '550e8400-e29b-41d4-a716-446655440002';
    beforeEach(() => {
        // Mock logger
        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
        };
        // Mock repository
        mockRepository = {
            create: jest.fn(),
            getByUser: jest.fn(),
            getById: jest.fn(),
            deleteByUser: jest.fn(),
            getByOrganisation: jest.fn(),
            updateStatus: jest.fn(),
        };
        repository = mockRepository;
        service = new TransactionService_1.TransactionService(repository, mockLogger);
    });
    describe('create', () => {
        it('should create a transaction with valid input', async () => {
            const input = {
                userId,
                type: 'payment',
                amount: 100.5,
                currency: 'USD',
                description: 'Test payment',
            };
            const createdTransaction = {
                id: transactionId,
                organisationId,
                ...input,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockRepository.create.mockResolvedValue(createdTransaction);
            const result = await service.create(organisationId, input);
            expect(result).toEqual(createdTransaction);
            expect(mockRepository.create).toHaveBeenCalledWith(organisationId, expect.objectContaining({
                userId,
                type: 'payment',
                amount: 100.5,
                currency: 'USD',
                status: 'pending',
            }));
            expect(mockLogger.info).toHaveBeenCalledWith('Transaction created successfully', expect.objectContaining({
                organisationId,
                amount: 100.5,
            }));
        });
        it('should reject transactions with negative amount', async () => {
            const input = {
                userId,
                type: 'payment',
                amount: -100,
                currency: 'USD',
                description: 'Invalid payment',
            };
            await expect(service.create(organisationId, input)).rejects.toThrow('Transaction amount must be positive');
            expect(mockRepository.create).not.toHaveBeenCalled();
        });
        it('should reject transactions with zero amount', async () => {
            const input = {
                userId,
                type: 'payment',
                amount: 0,
                currency: 'USD',
                description: 'Invalid payment',
            };
            await expect(service.create(organisationId, input)).rejects.toThrow('Transaction amount must be positive');
        });
        it('should reject invalid currency code', async () => {
            const input = {
                userId,
                type: 'payment',
                amount: 100,
                currency: 'INVALID',
                description: 'Invalid currency',
            };
            await expect(service.create(organisationId, input)).rejects.toThrow('Validation failed');
        });
        it('should reject missing required fields', async () => {
            const input = {
                userId,
                type: 'payment',
                amount: 100,
                // missing currency and description
            };
            await expect(service.create(organisationId, input)).rejects.toThrow('Validation failed');
        });
        it('should reject empty description', async () => {
            const input = {
                userId,
                type: 'payment',
                amount: 100,
                currency: 'USD',
                description: '   ',
            };
            await expect(service.create(organisationId, input)).rejects.toThrow('Validation failed');
        });
        it('should reject invalid organisation ID', async () => {
            const input = {
                userId,
                type: 'payment',
                amount: 100,
                currency: 'USD',
                description: 'Test',
            };
            await expect(service.create('', input)).rejects.toThrow('Organisation ID is required');
            await expect(service.create(null, input)).rejects.toThrow('Organisation ID is required');
        });
    });
    describe('getByUser', () => {
        it('should retrieve transactions for a user', async () => {
            const mockTransactions = [
                {
                    id: transactionId,
                    organisationId,
                    userId,
                    type: 'payment',
                    amount: 100,
                    currency: 'USD',
                    status: 'completed',
                    description: 'Payment 1',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            mockRepository.getByUser.mockResolvedValue(mockTransactions);
            const result = await service.getByUser(organisationId, userId);
            expect(result).toEqual(mockTransactions);
            expect(mockRepository.getByUser).toHaveBeenCalledWith(organisationId, userId);
            expect(mockLogger.debug).toHaveBeenCalledWith('User transactions retrieved', expect.objectContaining({
                organisationId,
                userId,
                count: 1,
            }));
        });
        it('should return empty array when user has no transactions', async () => {
            mockRepository.getByUser.mockResolvedValue([]);
            const result = await service.getByUser(organisationId, userId);
            expect(result).toEqual([]);
            expect(mockRepository.getByUser).toHaveBeenCalledWith(organisationId, userId);
        });
        it('should reject invalid organisation ID', async () => {
            await expect(service.getByUser('', userId)).rejects.toThrow('Organisation ID is required');
            await expect(service.getByUser(null, userId)).rejects.toThrow('Organisation ID is required');
        });
        it('should reject invalid user ID', async () => {
            await expect(service.getByUser(organisationId, '')).rejects.toThrow('User ID is required');
            await expect(service.getByUser(organisationId, null)).rejects.toThrow('User ID is required');
        });
        it('should ensure organisation isolation', async () => {
            const otherOrgId = '550e8400-e29b-41d4-a716-446655440099';
            mockRepository.getByUser.mockResolvedValue([]);
            await service.getByUser(otherOrgId, userId);
            expect(mockRepository.getByUser).toHaveBeenCalledWith(otherOrgId, userId);
            expect(mockRepository.getByUser).not.toHaveBeenCalledWith(organisationId, userId);
        });
    });
    describe('getById', () => {
        it('should retrieve a transaction by ID', async () => {
            const mockTransaction = {
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
            mockRepository.getById.mockResolvedValue(mockTransaction);
            const result = await service.getById(organisationId, transactionId);
            expect(result).toEqual(mockTransaction);
            expect(mockRepository.getById).toHaveBeenCalledWith(organisationId, transactionId);
        });
        it('should return null for non-existent transaction', async () => {
            mockRepository.getById.mockResolvedValue(null);
            const result = await service.getById(organisationId, 'non-existent-id');
            expect(result).toBeNull();
        });
        it('should ensure organisation isolation', async () => {
            const otherOrgId = '550e8400-e29b-41d4-a716-446655440099';
            mockRepository.getById.mockResolvedValue(null);
            await service.getById(otherOrgId, transactionId);
            expect(mockRepository.getById).toHaveBeenCalledWith(otherOrgId, transactionId);
            expect(mockRepository.getById).not.toHaveBeenCalledWith(organisationId, transactionId);
        });
    });
    describe('deleteAllByUser', () => {
        it('should delete all transactions for a user', async () => {
            mockRepository.deleteByUser.mockResolvedValue(3);
            const result = await service.deleteAllByUser(organisationId, userId);
            expect(result).toBe(3);
            expect(mockRepository.deleteByUser).toHaveBeenCalledWith(organisationId, userId);
            expect(mockLogger.warn).toHaveBeenCalledWith('Deleting all transactions for user', expect.objectContaining({
                organisationId,
                userId,
            }));
            expect(mockLogger.info).toHaveBeenCalledWith('Transactions deleted', expect.objectContaining({
                organisationId,
                userId,
                deletedCount: 3,
            }));
        });
        it('should return 0 when user has no transactions', async () => {
            mockRepository.deleteByUser.mockResolvedValue(0);
            const result = await service.deleteAllByUser(organisationId, userId);
            expect(result).toBe(0);
        });
        it('should reject invalid organisation ID', async () => {
            await expect(service.deleteAllByUser('', userId)).rejects.toThrow('Organisation ID is required');
        });
        it('should reject invalid user ID', async () => {
            await expect(service.deleteAllByUser(organisationId, '')).rejects.toThrow('User ID is required');
        });
        it('should ensure organisation isolation', async () => {
            const otherOrgId = '550e8400-e29b-41d4-a716-446655440099';
            mockRepository.deleteByUser.mockResolvedValue(0);
            await service.deleteAllByUser(otherOrgId, userId);
            expect(mockRepository.deleteByUser).toHaveBeenCalledWith(otherOrgId, userId);
            expect(mockRepository.deleteByUser).not.toHaveBeenCalledWith(organisationId, userId);
        });
    });
    describe('error handling', () => {
        it('should log and re-throw repository errors on create', async () => {
            const input = {
                userId,
                type: 'payment',
                amount: 100,
                currency: 'USD',
                description: 'Test',
            };
            const error = new Error('Database error');
            mockRepository.create.mockRejectedValue(error);
            await expect(service.create(organisationId, input)).rejects.toThrow('Database error');
            expect(mockLogger.error).toHaveBeenCalledWith('Failed to create transaction', expect.objectContaining({
                organisationId,
            }));
        });
        it('should log and re-throw repository errors on getByUser', async () => {
            const error = new Error('Database error');
            mockRepository.getByUser.mockRejectedValue(error);
            await expect(service.getByUser(organisationId, userId)).rejects.toThrow('Database error');
            expect(mockLogger.error).toHaveBeenCalledWith('Failed to retrieve user transactions', expect.any(Object));
        });
    });
});
