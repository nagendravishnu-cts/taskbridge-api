"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceRepository = void 0;
class BalanceRepository {
    constructor() {
        this.entries = [];
        this.snapshots = [];
    }
    async getEntriesByProject(projectId, organisationId) {
        return this.entries.filter((entry) => entry.projectId === projectId && entry.organisationId === organisationId);
    }
    async saveSnapshot(snapshot) {
        this.snapshots.push(snapshot);
        return snapshot;
    }
    async getHistory(projectId, organisationId) {
        return this.snapshots.filter((snapshot) => snapshot.projectId === projectId && snapshot.organisationId === organisationId);
    }
}
exports.BalanceRepository = BalanceRepository;
