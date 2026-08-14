import { Bill } from "../types/Bill";
import { Debt } from "../types/Debt";
import { Income } from "../types/Income";

export interface FinancialSummary {
  totalIncome: number;
  totalBills: number;
  totalDebtPayments: number;
  remainingCash: number;
}

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
  };
}