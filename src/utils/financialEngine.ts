import { Bill } from "../types/Bill";
import { Debt } from "../types/Debt";
import { Income } from "../types/Income";
import { FinancialSummary } from "../types/FinancialSummary";

export function calculateFinancialSummary(
  bills: Bill[],
  debts: Debt[],
  income: Income[]
): FinancialSummary {
  const totalIncome = income.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalBills = bills.reduce(
    (sum, bill) => sum + bill.amount,
    0
  );

  const totalDebtPayments = debts.reduce(
    (sum, debt) => sum + debt.minimumPayment,
    0
  );

  const remainingCash =
    totalIncome -
    totalBills -
    totalDebtPayments;

  return {
    totalIncome,
    totalBills,
    totalDebtPayments,
    remainingCash,
    monthlyCashFlow: remainingCash,
  };
}

export function calculateNextPayday(
  income: Income[]
): string | null {
  if (income.length === 0) {
    return null;
  }

  return [...income]
    .sort((a, b) =>
      a.nextPayDate.localeCompare(b.nextPayDate)
    )[0].nextPayDate;
}

export function calculateSafeToSpend(
  summary: FinancialSummary
): number {
  return Math.max(summary.remainingCash, 0);
}