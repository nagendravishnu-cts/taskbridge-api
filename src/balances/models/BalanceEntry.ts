export type BalanceDirection = 'credit' | 'debit';
export type BalanceEntrySourceType = 'transaction' | 'milestone' | 'adjustment' | 'project';

export interface BalanceEntry {
  id: string;
  organisationId: string;
  userId: string;
  projectId: string;
  currency: string;
  sourceType: BalanceEntrySourceType;
  sourceId: string;
  direction: BalanceDirection;
  amount: number;
  createdAt: Date;
}
