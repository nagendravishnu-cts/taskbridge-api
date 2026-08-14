export type ExpenseSplitType = 'equal' | 'percentage' | 'custom';
export type ExpenseType = 'expense' | 'paid';

export interface ExpenseParticipantShare {
  userId: string;
  share: number;
  amount?: number;
}

export interface Expense {
  id: string;
  organisationId: string;
  projectId: string;
  payerUserId: string;
  title: string;
  totalAmount: number;
  currency: string;
  splitType: ExpenseSplitType;
  participants: string[] | ExpenseParticipantShare[];
  createdAt: Date;
  splits?: ExpenseParticipantShare[];
}

export interface ExpenseBalanceEntry {
  userId: string;
  amount: number;
  type: 'expense' | 'paid';
}
