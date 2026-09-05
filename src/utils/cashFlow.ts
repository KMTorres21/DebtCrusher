import { Bill } from "../types/Bill";
import { Debt } from "../types/Debt";
import { Income } from "../types/Income";
import { FinancialSummary } from "../types/FinancialSummary";
import { calculateMonthlyIncome } from "./calculateMonthlyIncome";

export function calculateFinancialSummary(
  bills: Bill[],
  debts: Debt[],
  income: Income[]
): FinancialSummary {
  const today = new Date();
  const totalIncome = calculateMonthlyIncome(
    income,
    today.getFullYear(),
    today.getMonth()
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
    totalIncome - totalBills - totalDebtPayments;

  return {
    totalIncome,
    totalBills,
    totalDebtPayments,
    remainingCash,
    monthlyCashFlow: remainingCash,
  };
}