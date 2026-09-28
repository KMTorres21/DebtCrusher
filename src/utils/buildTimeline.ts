import { Bill } from "../types/Bill";
import { Debt } from "../types/Debt";
import { Income } from "../types/Income";
import { TimelineEvent } from "../types/TimelineEvent";

export function buildTimeline(
  bills: Bill[],
  debts: Debt[],
  income: Income[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  income.forEach((item) => {
    events.push({
      id: item.id,
      date: item.nextPayDate,
      type: "income",
      title: item.source,
      amount: item.amount,
    });
  });

  bills.forEach((bill) => {
    events.push({
      id: bill.id,
      date: bill.dueDate,
      type: "bill",
      title: bill.name,
      amount: -bill.amount,
    });
  });

  debts.forEach((debt) => {
    events.push({
      id: debt.id,
      date: debt.dueDate,
      type: "debt",
      title: debt.name,
      amount: -debt.minimumPayment,
    });
  });

  return events.sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}