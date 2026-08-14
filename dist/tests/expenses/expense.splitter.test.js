"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ExpenseSplitter_1 = require("../../src/expenses/services/ExpenseSplitter");
const ExpenseService_1 = require("../../src/expenses/services/ExpenseService");
describe('ExpenseSplitter', () => {
    it('splits an expense equally across participants', () => {
        const result = ExpenseSplitter_1.ExpenseSplitter.calculateSplit({
            totalAmount: 120,
            splitType: 'equal',
            participants: ['user-1', 'user-2', 'user-3'],
        });
        expect(result).toEqual([
            { userId: 'user-1', share: 40, amount: 40 },
            { userId: 'user-2', share: 40, amount: 40 },
            { userId: 'user-3', share: 40, amount: 40 },
        ]);
    });
    it('splits an expense by percentage weights', () => {
        const result = ExpenseSplitter_1.ExpenseSplitter.calculateSplit({
            totalAmount: 100,
            splitType: 'percentage',
            participants: [
                { userId: 'user-1', share: 50 },
                { userId: 'user-2', share: 30 },
                { userId: 'user-3', share: 20 },
            ],
        });
        expect(result).toEqual([
            { userId: 'user-1', share: 50, amount: 50 },
            { userId: 'user-2', share: 30, amount: 30 },
            { userId: 'user-3', share: 20, amount: 20 },
        ]);
    });
    it('rounds split amounts consistently for equal shares', () => {
        const result = ExpenseSplitter_1.ExpenseSplitter.calculateSplit({
            totalAmount: 101,
            splitType: 'equal',
            participants: ['user-1', 'user-2', 'user-3'],
        });
        expect(result).toEqual([
            { userId: 'user-1', share: 33.67, amount: 33.67 },
            { userId: 'user-2', share: 33.67, amount: 33.67 },
            { userId: 'user-3', share: 33.67, amount: 33.67 },
        ]);
    });
    it('rejects negative total amounts', () => {
        expect(() => ExpenseSplitter_1.ExpenseSplitter.calculateSplit({
            totalAmount: -10,
            splitType: 'equal',
            participants: ['user-1', 'user-2'],
        })).toThrow('Total amount must be non-negative');
    });
    it('returns empty list when no participants are supplied', () => {
        const result = ExpenseSplitter_1.ExpenseSplitter.calculateSplit({
            totalAmount: 100,
            splitType: 'equal',
            participants: [],
        });
        expect(result).toEqual([]);
    });
    it('rejects percentage split when total share is zero', () => {
        expect(() => ExpenseSplitter_1.ExpenseSplitter.calculateSplit({
            totalAmount: 100,
            splitType: 'percentage',
            participants: [
                { userId: 'user-1', share: 0 },
                { userId: 'user-2', share: 0 },
            ],
        })).toThrow('Total percentage share must be greater than zero');
    });
    it('calculates net balances from expenses and payments', () => {
        const result = ExpenseSplitter_1.ExpenseSplitter.calculateNetBalances([
            { userId: 'user-1', amount: 100, type: 'expense' },
            { userId: 'user-2', amount: 100, type: 'paid' },
            { userId: 'user-1', amount: 40, type: 'expense' },
        ]);
        expect(result).toEqual({
            'user-1': -140,
            'user-2': 100,
        });
    });
});
describe('ExpenseService', () => {
    let service;
    let repository;
    let auditService;
    let logger;
    beforeEach(() => {
        repository = {
            create: jest.fn(),
            findByProjectId: jest.fn(),
        };
        auditService = {
            recordAudit: jest.fn().mockResolvedValue({ id: 'audit-1' }),
        };
        logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
        service = new ExpenseService_1.ExpenseService(repository, auditService, logger);
    });
    it('creates an expense and records the split with audit', async () => {
        repository.create.mockResolvedValue({
            id: 'expense-1',
            organisationId: 'org-1',
            projectId: 'project-1',
            payerUserId: 'user-1',
            title: 'Lunch',
            totalAmount: 120,
            currency: 'USD',
            splitType: 'equal',
            participants: ['user-1', 'user-2', 'user-3'],
            createdAt: new Date(),
        });
        const result = await service.createExpense({
            organisationId: 'org-1',
            projectId: 'project-1',
            payerUserId: 'user-1',
            title: 'Lunch',
            totalAmount: 120,
            currency: 'USD',
            splitType: 'equal',
            participants: ['user-1', 'user-2', 'user-3'],
        });
        expect(result.totalAmount).toBe(120);
        expect(result.splits).toEqual([
            { userId: 'user-1', share: 40, amount: 40 },
            { userId: 'user-2', share: 40, amount: 40 },
            { userId: 'user-3', share: 40, amount: 40 },
        ]);
        expect(auditService.recordAudit).toHaveBeenCalledWith(expect.objectContaining({
            eventType: 'expense_created',
            entityType: 'expense',
            projectId: 'project-1',
            actorOrganisationId: 'org-1',
        }));
    });
    it('rejects creating an expense for another organisation', async () => {
        await expect(service.createExpense({
            organisationId: 'org-1',
            projectId: 'project-1',
            payerUserId: 'user-1',
            title: 'Lunch',
            totalAmount: 100,
            currency: 'USD',
            splitType: 'equal',
            participants: ['user-4'],
            allowedOrganisationId: 'org-2',
        })).rejects.toThrow('Organisation mismatch');
    });
    it('requires the minimum organisation, project, and user identifiers', async () => {
        await expect(service.createExpense({
            organisationId: '',
            projectId: 'project-1',
            payerUserId: 'user-1',
            title: 'Lunch',
            totalAmount: 50,
            currency: 'USD',
            splitType: 'equal',
            participants: ['user-1'],
        })).rejects.toThrow('Organisation ID, project ID and payer user ID are required');
        await expect(service.createExpense({
            organisationId: 'org-1',
            projectId: '',
            payerUserId: 'user-1',
            title: 'Lunch',
            totalAmount: 50,
            currency: 'USD',
            splitType: 'equal',
            participants: ['user-1'],
        })).rejects.toThrow('Organisation ID, project ID and payer user ID are required');
    });
    it('logs creation and returns the stored expense with splits', async () => {
        repository.create.mockResolvedValue({
            id: 'expense-2',
            organisationId: 'org-1',
            projectId: 'project-2',
            payerUserId: 'user-5',
            title: 'Dinner',
            totalAmount: 80,
            currency: 'USD',
            splitType: 'equal',
            participants: ['user-5', 'user-6'],
            createdAt: new Date(),
        });
        const result = await service.createExpense({
            organisationId: 'org-1',
            projectId: 'project-2',
            payerUserId: 'user-5',
            title: 'Dinner',
            totalAmount: 80,
            currency: 'USD',
            splitType: 'equal',
            participants: ['user-5', 'user-6'],
        });
        expect(logger.info).toHaveBeenCalledWith('Expense created', expect.objectContaining({
            expenseId: 'expense-2',
            projectId: 'project-2',
            organisationId: 'org-1',
            totalAmount: 80,
        }));
        expect(result.splits).toEqual([
            { userId: 'user-5', share: 40, amount: 40 },
            { userId: 'user-6', share: 40, amount: 40 },
        ]);
    });
});
