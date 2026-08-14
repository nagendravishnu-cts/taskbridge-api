export type AuditSnapshot = Record<string, unknown> | null;

export interface AuditLog {
  id: string;
  eventType: string;
  entityType: string;
  entityId: string;
  projectId: string;
  actorUserId: string;
  actorOrganisationId: string;
  previousState: AuditSnapshot;
  newState: AuditSnapshot;
  timestamp: Date;
}

export interface AuditLogFilters {
  eventType?: string;
  startDate?: string;
  endDate?: string;
}
