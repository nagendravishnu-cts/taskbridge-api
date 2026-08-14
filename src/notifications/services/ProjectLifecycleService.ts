import { Logger } from 'winston';
import { AuditLog } from '../models/AuditLog';
import { Notification } from '../models/Notification';
import { AuditService, RecordAuditInput } from './AuditService';
import { NotificationService, NotifyProjectMembersInput } from './NotificationService';

export interface ProjectMilestoneChangeInput {
  projectId: string;
  entityType?: string;
  entityId?: string;
  eventType: 'project_created' | 'project_status_updated' | 'project_deleted';
  previousState: Record<string, unknown> | null;
  newState: Record<string, unknown> | null;
  actorUserId: string;
  actorOrganisationId: string;
  recipients: string[];
  message: string;
}

export class ProjectLifecycleService {
  constructor(
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
    private readonly logger: Logger,
  ) {}

  async onProjectMilestoneChange(input: ProjectMilestoneChangeInput): Promise<{ auditEntry: AuditLog; notifications: Notification[] }> {
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
