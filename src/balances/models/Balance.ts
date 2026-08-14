export interface Balance {
  id: string;
  organisationId: string;
  userId: string;
  projectId: string;
  currency: string;
  availableBalance: number;
  pendingBalance: number;
  reservedBalance: number;
  totalInflow: number;
  totalOutflow: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BalanceSnapshot {
  id: string;
  balanceId: string;
  organisationId: string;
  userId: string;
  projectId: string;
  currency: string;
  eventType: string;
  previousBalance: number;
  newBalance: number;
  reason: string;
  createdAt: Date;
}
