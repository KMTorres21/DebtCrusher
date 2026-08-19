import { Bill } from "../types/Bill";
import { Debt } from "../types/Debt";
import { Income } from "../types/Income";
import { CalendarEvent } from "../types/CalendarEvent";

function parseDate(dateString: string): Date {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isInMonth(
  date: Date,
  year: number,
  month: number
): boolean {
  return (
    date.getFullYear() === year &&
    date.getMonth() === month
  );
}

function addIncomeEvents(
  events: CalendarEvent[],
  item: Income,
  year: number,
  month: number
) {
  let payDate = parseDate(item.nextPayDate);

  if (item.frequency === "onetime") {
    if (isInMonth(payDate, year, month)) {
      events.push({
        id: item.id,
        date: formatDate(payDate),
        type: "income",
        title: item.source,
        amount: item.amount,
      });
    }

    return;
  }

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  if (item.frequency === "weekly") {
    while (payDate < monthStart) {
      payDate.setDate(payDate.getDate() + 7);
    }

    while (payDate <= monthEnd) {
      events.push({
        id: `${item.id}-${formatDate(payDate)}`,
        date: formatDate(payDate),
        type: "income",
        title: item.source,
        amount: item.amount,
      });

      payDate.setDate(payDate.getDate() + 7);
    }

    return;
  }

  if (item.frequency === "biweekly") {
    while (payDate < monthStart) {
      payDate.setDate(payDate.getDate() + 14);
    }

    while (payDate <= monthEnd) {
      events.push({
        id: `${item.id}-${formatDate(payDate)}`,
        date: formatDate(payDate),
        type: "income",
        title: item.source,
        amount: item.amount,
      });

      payDate.setDate(payDate.getDate() + 14);
    }

    return;
  }

  if (item.frequency === "monthly") {
    while (payDate < monthStart) {
      payDate.setMonth(payDate.getMonth() + 1);
    }

    if (payDate <= monthEnd) {
      events.push({
        id: `${item.id}-${formatDate(payDate)}`,
        date: formatDate(payDate),
        type: "income",
        title: item.source,
        amount: item.amount,
      });
    }

    return;
  }

  // semimonthly
  while (payDate < monthStart) {
    payDate.setDate(payDate.getDate() + 15);
  }

  while (payDate <= monthEnd) {
    events.push({
      id: `${item.id}-${formatDate(payDate)}`,
      date: formatDate(payDate),
      type: "income",
      title: item.source,
      amount: item.amount,
    });

    payDate.setDate(payDate.getDate() + 15);
  }
}

export function buildCalendarEvents(
  bills: Bill[],
  income: Income[],
  debts: Debt[],
  year: number,
  month: number
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  bills.forEach((bill) => {
    const dueDate = parseDate(bill.dueDate);

    if (dueDate >= monthStart && dueDate <= monthEnd) {
      events.push({
        id: bill.id,
        date: bill.dueDate,
        type: "bill",
        title: bill.name,
        amount: bill.amount,
        paid: bill.paid,
      });
    }
  });

  income.forEach((item) => {
    addIncomeEvents(events, item, year, month);
  });

  debts.forEach((debt) => {
    const dueDate = parseDate(debt.dueDate);

    if (dueDate >= monthStart && dueDate <= monthEnd) {
      events.push({
        id: debt.id,
        date: debt.dueDate,
        type: "debt",
        title: debt.name,
        amount: debt.minimumPayment,
      });
    }
  });

  return events.sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}