"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseRepository = void 0;
class ExpenseRepository {
    constructor() {
        this.expenses = [];
    }
    async create(expense) {
        this.expenses.push(expense);
        return expense;
    }
    async findByProjectId(projectId, organisationId) {
        return this.expenses.filter((expense) => expense.projectId === projectId && expense.organisationId === organisationId);
    }
}
exports.ExpenseRepository = ExpenseRepository;
