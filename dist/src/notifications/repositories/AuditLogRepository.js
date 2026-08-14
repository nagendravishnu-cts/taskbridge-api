"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogRepository = void 0;
class AuditLogRepository {
    constructor() {
        this.entries = [];
    }
    async create(entry) {
        const storedEntry = {
            ...entry,
            timestamp: entry.timestamp ?? new Date(),
        };
        this.entries.push(storedEntry);
        return storedEntry;
    }
    async findByProjectId(projectId, organisationId, filters = {}) {
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
exports.AuditLogRepository = AuditLogRepository;
