import { Balance, BalanceSnapshot } from '../models/Balance';
import { BalanceEntry } from '../models/BalanceEntry';

export class BalanceRepository {
  private readonly entries: BalanceEntry[] = [];
  private readonly snapshots: BalanceSnapshot[] = [];

  async getEntriesByProject(projectId: string, organisationId: string): Promise<BalanceEntry[]> {
    return this.entries.filter(
      (entry) => entry.projectId === projectId && entry.organisationId === organisationId,
    );
  }

  async saveSnapshot(snapshot: BalanceSnapshot): Promise<BalanceSnapshot> {
    this.snapshots.push(snapshot);
    return snapshot;
  }

  async getHistory(projectId: string, organisationId: string): Promise<BalanceSnapshot[]> {
    return this.snapshots.filter(
      (snapshot) => snapshot.projectId === projectId && snapshot.organisationId === organisationId,
    );
  }
}
