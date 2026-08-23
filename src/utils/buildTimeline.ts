import { Bill } from "../types/Bill";
import { Debt } from "../types/Debt";
import { Income } from "../types/Income";
import { TimelineEvent } from "../types/TimelineEvent";
import {
  getBillOccurrences,
  getIncomeOccurrences,
} from "./calendarOccurrences";

export function buildTimeline(
  bills: Bill[],
  debts: Debt[],
  income: Income[],
  year: number,
  month: number
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  income.forEach((item) => {
    const occurrences = getIncomeOccurrences(
      item,
      year,
      month
    );

    occurrences.forEach((date) => {
      events.push({
        id: `${item.id}-${date}`,
        date,
        type: "income",
        title: item.source,
        amount: item.amount,
      });
    });
  });

  bills.forEach((bill) => {
    const occurrences = getBillOccurrences(
      bill,
      year,
      month
    );

    occurrences.forEach((date) => {
      events.push({
        id: `${bill.id}-${date}`,
        date,
        type: "bill",
        title: bill.name,
        amount: -bill.amount,
      });
    });
  });

  debts.forEach((debt) => {
    const dueDate = new Date(
      `${debt.dueDate}T12:00:00`
    );

    if (Number.isNaN(dueDate.getTime())) {
      return;
    }

    if (
      dueDate.getFullYear() === year &&
      dueDate.getMonth() === month
    ) {
      events.push({
        id: debt.id,
        date: debt.dueDate,
        type: "debt",
        title: debt.name,
        amount: -debt.minimumPayment,
      });
    }
  });

  return events.sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}