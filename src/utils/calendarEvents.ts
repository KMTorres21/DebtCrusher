import { Bill } from "../types/Bill";
import { Debt } from "../types/Debt";
import { Income } from "../types/Income";
import { CalendarEvent } from "../types/CalendarEvent";

export function buildCalendarEvents(
  bills: Bill[],
  income: Income[],
  debts: Debt[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  bills.forEach((bill) => {
    events.push({
      id: bill.id,
      date: bill.dueDate,
      type: "bill",
      title: bill.name,
      amount: bill.amount,
      paid: bill.paid,
    });
  });

  income.forEach((item) => {
    events.push({
      id: item.id,
      date: item.nextPayDate,
      type: "income",
      title: item.source,
      amount: item.amount,
    });
  });

  debts.forEach((debt) => {
    events.push({
      id: debt.id,
      date: debt.dueDate,
      type: "debt",
      title: debt.name,
      amount: debt.minimumPayment,
    });
  });

  return events.sort((a, b) => a.date.localeCompare(b.date));
}