"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceService = void 0;
const BalanceCalculator_1 = require("./BalanceCalculator");
class BalanceService {
    constructor(repository, auditService, logger) {
        this.repository = repository;
        this.auditService = auditService;
        this.logger = logger;
    }
    async recalculateProjectBalance(input) {
        if (!input.organisationId || !input.projectId || !input.userId) {
            throw new Error('Organisation ID, project ID and user ID are required');
        }
        const entries = await this.repository.getEntriesByProject(input.projectId, input.organisationId);
        if (entries.some((entry) => entry.organisationId !== input.organisationId)) {
            throw new Error('Organisation mismatch');
        }
        const previousBalance = 0;
        const calculated = BalanceCalculator_1.BalanceCalculator.calculate(entries);
        const newBalance = calculated.availableBalance;
        const snapshot = {
            id: `snapshot-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            balanceId: `balance-${input.projectId}`,
            organisationId: input.organisationId,
            userId: input.userId,
            projectId: input.projectId,
            currency: 'USD',
            eventType: input.eventType,
            previousBalance,
            newBalance,
            reason: input.reason,
            createdAt: new Date(),
        };
        const savedSnapshot = await this.repository.saveSnapshot(snapshot);
        await this.auditService.recordAudit({
            eventType: input.eventType,
            entityType: 'balance',
            entityId: snapshot.id,
            projectId: input.projectId,
            actorUserId: input.userId,
            actorOrganisationId: input.organisationId,
            previousState: { balance: previousBalance },
            newState: { balance: newBalance },
        });
        this.logger.info('Balance recalculated', {
            projectId: input.projectId,
            organisationId: input.organisationId,
            userId: input.userId,
            newBalance,
            eventType: input.eventType,
        });
        return savedSnapshot;
    }
}
exports.BalanceService = BalanceService;
