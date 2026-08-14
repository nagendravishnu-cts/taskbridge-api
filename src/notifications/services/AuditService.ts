import { Logger } from 'winston';
import { AuditLog, AuditLogFilters } from '../models/AuditLog';
import { AuditLogRepository } from '../repositories/AuditLogRepository';

export interface RecordAuditInput {
  eventType: string;
  entityType: string;
  entityId: string;
  projectId: string;
  actorUserId: string;
  actorOrganisationId: string;
  previousState: Record<string, unknown> | null;
  newState: Record<string, unknown> | null;
  id?: string;
  timestamp?: Date;
}

export class AuditService {
  constructor(
    private readonly repository: AuditLogRepository,
    private readonly logger: Logger,
  ) {}

  async recordAudit(input: RecordAuditInput): Promise<AuditLog> {
    const auditEntry: AuditLog = {
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

  async getProjectHistory(
    organisationId: string,
    projectId: string,
    filters: AuditLogFilters = {},
  ): Promise<AuditLog[]> {
    if (!organisationId || !projectId) {
      throw new Error('Organisation ID and project ID are required');
    }

    return this.repository.findByProjectId(projectId, organisationId, filters);
  }

  async update(_id: string, _changes: Partial<AuditLog>): Promise<AuditLog> {
    throw new Error('Audit entries are immutable and cannot be updated');
  }

  async delete(_id: string): Promise<void> {
    throw new Error('Audit entries are immutable and cannot be deleted');
  }
}
