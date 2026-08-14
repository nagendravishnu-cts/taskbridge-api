"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const express_1 = require("express");
class AuditController {
    constructor(service, logger) {
        this.service = service;
        this.logger = logger;
    }
    getRouter() {
        const router = (0, express_1.Router)();
        router.post('/', this.recordAudit.bind(this));
        router.get('/:projectId', this.getAuditHistory.bind(this));
        return router;
    }
    async recordAudit(req, res) {
        try {
            const entry = await this.service.recordAudit(req.body);
            res.status(201).json({ success: true, data: entry });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Audit controller record failed', { error: message });
            res.status(400).json({ success: false, error: message });
        }
    }
    async getAuditHistory(req, res) {
        try {
            const organisationId = req.query.organisationId;
            const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
            const eventType = req.query.eventType;
            const startDate = req.query.startDate;
            const endDate = req.query.endDate;
            if (!organisationId) {
                throw new Error('Organisation ID is required');
            }
            const history = await this.service.getProjectHistory(organisationId, projectId, {
                eventType,
                startDate,
                endDate,
            });
            res.status(200).json({ success: true, data: history, count: history.length });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Audit controller history failed', { error: message });
            res.status(400).json({ success: false, error: message });
        }
    }
}
exports.AuditController = AuditController;
