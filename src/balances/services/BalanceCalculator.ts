import { BalanceEntry } from '../models/BalanceEntry';

export interface CalculatedBalance {
  totalInflow: number;
  totalOutflow: number;
  availableBalance: number;
  pendingBalance: number;
  reservedBalance: number;
}

export class BalanceCalculator {
  static calculate(entries: BalanceEntry[]): CalculatedBalance {
    const totals = entries.reduce(
      (accumulator, entry) => {
        if (entry.direction === 'credit') {
          accumulator.totalInflow += entry.amount;
        } else {
          accumulator.totalOutflow += entry.amount;
        }

        return accumulator;
      },
      { totalInflow: 0, totalOutflow: 0 },
    );

    const net = totals.totalInflow - totals.totalOutflow;

    return {
      totalInflow: totals.totalInflow,
      totalOutflow: totals.totalOutflow,
      availableBalance: net,
      pendingBalance: 0,
      reservedBalance: 0,
    };
  }
}
