import { ExpenseParticipantShare, ExpenseBalanceEntry } from '../models/Expense';

export interface CalculateSplitInput {
  totalAmount: number;
  splitType: 'equal' | 'percentage';
  participants: string[] | Array<{ userId: string; share: number }>;
}

export class ExpenseSplitter {
  static calculateSplit(input: CalculateSplitInput): ExpenseParticipantShare[] {
    if (input.totalAmount < 0) {
      throw new Error('Total amount must be non-negative');
    }

    if (input.splitType === 'equal') {
      const list = (Array.isArray(input.participants) ? input.participants : []) as string[];
      const count = list.length || 0;

      if (count === 0) {
        return [];
      }

      const share = Number((input.totalAmount / count).toFixed(2));

      return list.map((userId) => ({
        userId,
        share,
        amount: share,
      }));
    }

    const participantShares = (Array.isArray(input.participants) ? input.participants : []) as Array<{
      userId: string;
      share: number;
    }>;

    const totalShares = participantShares.reduce((sum, item) => sum + Number(item.share || 0), 0);

    if (totalShares <= 0) {
      throw new Error('Total percentage share must be greater than zero');
    }

    return participantShares.map((item) => {
      const amount = Number(((input.totalAmount * Number(item.share)) / totalShares).toFixed(2));
      return {
        userId: item.userId,
        share: Number(item.share),
        amount,
      };
    });
  }

  static calculateNetBalances(entries: ExpenseBalanceEntry[]): Record<string, number> {
    // Negative values mean the user owes money; positive values mean the user should receive money.
    return entries.reduce((balances, entry) => {
      const current = balances[entry.userId] ?? 0;
      if (entry.type === 'expense') {
        balances[entry.userId] = current - entry.amount;
      } else {
        balances[entry.userId] = current + entry.amount;
      }
      return balances;
    }, {} as Record<string, number>);
  }
}
