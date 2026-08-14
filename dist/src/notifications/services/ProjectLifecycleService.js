"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectLifecycleService = void 0;
class ProjectLifecycleService {
    constructor(auditService, notificationService, logger) {
        this.auditService = auditService;
        this.notificationService = notificationService;
        this.logger = logger;
    }
    async onProjectMilestoneChange(input) {
        const auditEntry = await this.auditService.recordAudit({
            eventType: input.eventType,
            entityType: input.entityType ?? 'project',
            entityId: input.entityId ?? input.projectId,
            projectId: input.projectId,
            actorUserId: input.actorUserId,
            actorOrganisationId: input.actorOrganisationId,
            previousState: input.previousState,
            newState: input.newState,
        });
        const notifications = await this.notificationService.notifyProjectMembers({
            projectId: input.projectId,
            eventType: input.eventType,
            message: input.message,
            recipients: input.recipients,
        });
        this.logger.info('Project milestone change processed', {
            projectId: input.projectId,
            eventType: input.eventType,
            auditId: auditEntry.id,
            notificationCount: notifications.length,
        });
        return { auditEntry, notifications };
    }
}
exports.ProjectLifecycleService = ProjectLifecycleService;
