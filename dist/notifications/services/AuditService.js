"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
class AuditService {
    constructor(repository, logger) {
        this.repository = repository;
        this.logger = logger;
    }
    async recordAudit(input) {
        const auditEntry = {
            id: input.id ?? `audit-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            eventType: input.eventType,
            entityType: input.entityType,
            entityId: input.entityId,
            projectId: input.projectId,
            actorUserId: input.actorUserId,
            actorOrganisationId: input.actorOrganisationId,
            previousState: input.previousState,
            newState: input.newState,
            timestamp: input.timestamp ?? new Date(),
        };
        const created = await this.repository.create(auditEntry);
        this.logger.info('Audit entry recorded', {
            auditId: created.id,
            eventType: created.eventType,
            projectId: created.projectId,
            entityId: created.entityId,
            actorOrganisationId: created.actorOrganisationId,
        });
        return created;
    }
    async getProjectHistory(organisationId, projectId, filters = {}) {
        if (!organisationId || !projectId) {
            throw new Error('Organisation ID and project ID are required');
        }
        return this.repository.findByProjectId(projectId, organisationId, filters);
    }
    async update(_id, _changes) {
        throw new Error('Audit entries are immutable and cannot be updated');
    }
    async delete(_id) {
        throw new Error('Audit entries are immutable and cannot be deleted');
    }
}
exports.AuditService = AuditService;
