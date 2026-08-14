import { AuditLog, AuditLogFilters } from '../models/AuditLog';

export class AuditLogRepository {
  private readonly entries: AuditLog[] = [];

  async create(entry: AuditLog): Promise<AuditLog> {
    const storedEntry: AuditLog = {
      ...entry,
      timestamp: entry.timestamp ?? new Date(),
    };

    this.entries.push(storedEntry);
    return storedEntry;
  }

  async findByProjectId(
    projectId: string,
    organisationId: string,
    filters: AuditLogFilters = {},
  ): Promise<AuditLog[]> {
    return this.entries.filter((entry) => {
      if (entry.projectId !== projectId) {
        return false;
      }

      if (entry.actorOrganisationId !== organisationId) {
        return false;
      }

      if (filters.eventType && entry.eventType !== filters.eventType) {
        return false;
      }

      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        if (Number.isNaN(startDate.getTime()) || entry.timestamp < startDate) {
          return false;
        }
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        if (Number.isNaN(endDate.getTime()) || entry.timestamp > endDate) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}
