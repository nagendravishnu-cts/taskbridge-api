"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceController = void 0;
const express_1 = require("express");
class BalanceController {
    constructor(service, logger) {
        this.service = service;
        this.logger = logger;
    }
    getRouter() {
        const router = (0, express_1.Router)();
        router.get('/project/:projectId', this.getProjectBalance.bind(this));
        router.get('/user/:userId', this.getUserBalance.bind(this));
        router.post('/recalculate', this.recalculate.bind(this));
        return router;
    }
    async getProjectBalance(req, res) {
        try {
            const organisationId = req.organisationId ?? '';
            const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
            const entries = await this.service.repository.getEntriesByProject(projectId, organisationId);
            const result = { projectId, organisationId, balances: entries };
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Balance controller project lookup failed', { error: message });
            res.status(400).json({ success: false, error: message });
        }
    }
    async getUserBalance(req, res) {
        try {
            const organisationId = req.organisationId ?? '';
            const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
            const entries = await this.service.repository.getEntriesByProject(userId, organisationId);
            const result = { userId, organisationId, balances: entries };
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Balance controller user lookup failed', { error: message });
            res.status(400).json({ success: false, error: message });
        }
    }
    async recalculate(req, res) {
        try {
            const snapshot = await this.service.recalculateProjectBalance({
                organisationId: req.body.organisationId,
                projectId: req.body.projectId,
                userId: req.body.userId,
                eventType: req.body.eventType,
                reason: req.body.reason,
            });
            res.status(200).json({ success: true, data: snapshot });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Balance controller recalc failed', { error: message });
            res.status(400).json({ success: false, error: message });
        }
    }
}
exports.BalanceController = BalanceController;
