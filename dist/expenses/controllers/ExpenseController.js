"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseController = void 0;
const express_1 = require("express");
class ExpenseController {
    constructor(service, logger) {
        this.service = service;
        this.logger = logger;
    }
    getRouter() {
        const router = (0, express_1.Router)();
        router.post('/', this.create.bind(this));
        router.get('/project/:projectId', this.getByProject.bind(this));
        return router;
    }
    async create(req, res) {
        try {
            const organisationId = req.organisationId ?? '';
            const input = {
                ...req.body,
                organisationId,
            };
            const expense = await this.service.createExpense(input);
            res.status(201).json({ success: true, data: expense });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Expense controller create failed', { error: message });
            res.status(400).json({ success: false, error: message });
        }
    }
    async getByProject(req, res) {
        try {
            const organisationId = req.organisationId ?? '';
            const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
            const repository = this.service.repository;
            const expenses = await repository.findByProjectId(projectId, organisationId);
            res.status(200).json({ success: true, data: expenses, count: expenses.length });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Expense controller project lookup failed', { error: message });
            res.status(400).json({ success: false, error: message });
        }
    }
}
exports.ExpenseController = ExpenseController;
