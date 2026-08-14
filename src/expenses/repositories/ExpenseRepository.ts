import { Expense } from '../models/Expense';

export class ExpenseRepository {
  private readonly expenses: Expense[] = [];

  async create(expense: Expense): Promise<Expense> {
    this.expenses.push(expense);
    return expense;
  }

  async findByProjectId(projectId: string, organisationId: string): Promise<Expense[]> {
    return this.expenses.filter(
      (expense) => expense.projectId === projectId && expense.organisationId === organisationId,
    );
  }
}
