"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseService = void 0;
const ExpenseSplitter_1 = require("./ExpenseSplitter");
class ExpenseService {
    constructor(repository, auditService, logger) {
        this.repository = repository;
        this.auditService = auditService;
        this.logger = logger;
    }
    async createExpense(input) {
        if (!input.organisationId || !input.projectId || !input.payerUserId) {
            throw new Error('Organisation ID, project ID and payer user ID are required');
        }
        if (input.allowedOrganisationId && input.allowedOrganisationId !== input.organisationId) {
            throw new Error('Organisation mismatch');
        }
        const splits = ExpenseSplitter_1.ExpenseSplitter.calculateSplit({
            totalAmount: input.totalAmount,
            splitType: input.splitType,
            participants: input.participants,
        });
        const expense = {
            id: `expense-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            organisationId: input.organisationId,
            projectId: input.projectId,
            payerUserId: input.payerUserId,
            title: input.title,
            totalAmount: input.totalAmount,
            currency: input.currency,
            splitType: input.splitType,
            participants: input.participants,
            createdAt: new Date(),
            splits,
        };
        const created = await this.repository.create(expense);
        await this.auditService.recordAudit({
            eventType: 'expense_created',
            entityType: 'expense',
            entityId: created.id,
            projectId: input.projectId,
            actorUserId: input.payerUserId,
            actorOrganisationId: input.organisationId,
            previousState: null,
            newState: {
                totalAmount: created.totalAmount,
                splitType: created.splitType,
                splits,
            },
        });
        this.logger.info('Expense created', {
            expenseId: created.id,
            projectId: created.projectId,
            organisationId: created.organisationId,
            totalAmount: created.totalAmount,
        });
        return { ...created, splits };
    }
}
exports.ExpenseService = ExpenseService;
