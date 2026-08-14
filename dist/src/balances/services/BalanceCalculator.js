"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceCalculator = void 0;
class BalanceCalculator {
    static calculate(entries) {
        const totals = entries.reduce((accumulator, entry) => {
            if (entry.direction === 'credit') {
                accumulator.totalInflow += entry.amount;
            }
            else {
                accumulator.totalOutflow += entry.amount;
            }
            return accumulator;
        }, { totalInflow: 0, totalOutflow: 0 });
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
exports.BalanceCalculator = BalanceCalculator;
