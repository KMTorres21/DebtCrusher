import { Income } from "../types/Income";
import { getIncomeOccurrences } from "./calendarOccurrences";

export function calculateMonthlyIncome(
  income: Income[],
  year: number,
  month: number
): number {
  return income.reduce((sum, item) => {
    const occurrences =
      getIncomeOccurrences(
        item,
        year,
        month
      );

    return (
      sum +
      occurrences.length * item.amount
    );
  }, 0);
}