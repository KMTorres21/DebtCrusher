import { Bill } from "../types/Bill";
import { Debt } from "../types/Debt";
import { Income } from "../types/Income";
import { FinancialSummary } from "../types/FinancialSummary";
import {
  getBillOccurrences,
  getIncomeOccurrences,
} from "./calendarOccurrences";

export function calculateFinancialSummary(
  bills: Bill[],
  debts: Debt[],
  income: Income[]
): FinancialSummary {
  const today = new Date();

  const year = today.getFullYear();
  const month = today.getMonth();

  const totalIncome = income.reduce((sum, item) => {
    const occurrences = getIncomeOccurrences(
      item,
      year,
      month
    );

    return occurrences.length > 0
      ? sum + item.amount * occurrences.length
      : sum;
  }, 0);

  const totalBills = bills.reduce((sum, bill) => {
    const occurrences = getBillOccurrences(
      bill,
      year,
      month
    );

    return occurrences.length > 0
      ? sum + bill.amount * occurrences.length
      : sum;
  }, 0);

  const totalDebtPayments = debts.reduce(
    (sum, debt) => {
      const dueDate = new Date(
        `${debt.dueDate}T12:00:00`
      );

      if (Number.isNaN(dueDate.getTime())) {
        return sum;
      }

      if (
        dueDate.getFullYear() === year &&
        dueDate.getMonth() === month
      ) {
        return sum + debt.minimumPayment;
      }

      return sum;
    },
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