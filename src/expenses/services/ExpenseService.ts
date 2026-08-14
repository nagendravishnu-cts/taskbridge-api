import { Logger } from 'winston';
import { Expense, ExpenseParticipantShare } from '../models/Expense';
import { ExpenseSplitter } from './ExpenseSplitter';

export interface CreateExpenseInput {
  organisationId: string;
  projectId: string;
  payerUserId: string;
  title: string;
  totalAmount: number;
  currency: string;
  splitType: 'equal' | 'percentage';
  participants: string[] | Array<{ userId: string; share: number }>;
  allowedOrganisationId?: string;
}

export interface ExpenseRepository {
  create(expense: Expense): Promise<Expense>;
  findByProjectId(projectId: string, organisationId: string): Promise<Expense[]>;
}

export interface AuditServiceLike {
  recordAudit(input: {
    eventType: string;
    entityType: string;
    entityId: string;
    projectId: string;
    actorUserId: string;
    actorOrganisationId: string;
    previousState: Record<string, unknown> | null;
    newState: Record<string, unknown> | null;
  }): Promise<{ id: string }>;
}

export class ExpenseService {
  constructor(
    private readonly repository: ExpenseRepository,
    private readonly auditService: AuditServiceLike,
    private readonly logger: Logger,
  ) {}

  async createExpense(input: CreateExpenseInput): Promise<Expense & { splits: ExpenseParticipantShare[] }> {
    if (!input.organisationId || !input.projectId || !input.payerUserId) {
      throw new Error('Organisation ID, project ID and payer user ID are required');
    }

    if (input.allowedOrganisationId && input.allowedOrganisationId !== input.organisationId) {
      throw new Error('Organisation mismatch');
    }

    const splits = ExpenseSplitter.calculateSplit({
      totalAmount: input.totalAmount,
      splitType: input.splitType,
      participants: input.participants,
    });

    const expense: Expense = {
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
