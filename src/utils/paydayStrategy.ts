import { Bill } from "../types/Bill";
import { Income } from "../types/Income";
import {
  getBillOccurrences,
  getIncomeOccurrences,
} from "./calendarOccurrences";

export interface PaydayBill {
  bill: Bill;
  dueDate: string;
}

export interface PaydayPlan {
  income: Income;
  payday: string;
  amount: number;
  nextPayday: string | null;
  bills: PaydayBill[];
  totalBills: number;
  remaining: number;
}

function parseDate(dateString: string): Date {
  return new Date(`${dateString}T12:00:00`);
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function addDays(
  date: Date,
  days: number
): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getNextPayday(
  payday: Date,
  frequency: Income["frequency"]
): Date | null {
  if (frequency === "onetime") {
    return null;
  }

  if (frequency === "weekly") {
    return addDays(payday, 7);
  }

  if (frequency === "biweekly") {
    return addDays(payday, 14);
  }

  if (frequency === "semimonthly") {
    const next = new Date(payday);
    next.setDate(next.getDate() + 15);
    return next;
  }

  if (frequency === "monthly") {
    const next = new Date(payday);
    next.setMonth(next.getMonth() + 1);

    /*
     * Prevent dates such as January 31
     * from rolling into March.
     */
    const originalDay = payday.getDate();
    const lastDay = new Date(
      next.getFullYear(),
      next.getMonth() + 1,
      0
    ).getDate();

    next.setDate(
      Math.min(originalDay, lastDay)
    );

    return next;
  }

  return null;
}

function getBillsThroughDate(
  bills: Bill[],
  startDate: Date,
  endDate: Date
): PaydayBill[] {
  const results: PaydayBill[] = [];

  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();

    for (const bill of bills) {
      const occurrences = getBillOccurrences(
        bill,
        year,
        month
      );

      for (const occurrence of occurrences) {
        const occurrenceDate =
          parseDate(occurrence);

        if (
          occurrenceDate > startDate &&
          occurrenceDate <= endDate
        ) {
          results.push({
            bill,
            dueDate: occurrence,
          });
        }
      }
    }

    cursor.setMonth(cursor.getMonth() + 1);
    cursor.setDate(1);
  }

  return results.sort((a, b) =>
    a.dueDate.localeCompare(b.dueDate)
  );
}

export function buildPaydayPlan(
  income: Income,
  bills: Bill[]
): PaydayPlan[] {
  const firstPayday = parseDate(
    income.nextPayDate
  );

  if (Number.isNaN(firstPayday.getTime())) {
    return [];
  }

  const plans: PaydayPlan[] = [];

  let payday = firstPayday;

  /*
   * Build the next 6 paychecks.
   */
  for (let i = 0; i < 6; i++) {
    const nextPayday = getNextPayday(
      payday,
      income.frequency
    );

    const billsForPayday =
      nextPayday === null
        ? []
        : getBillsThroughDate(
            bills,
            payday,
            nextPayday
          );

    const totalBills =
      billsForPayday.reduce(
        (sum, item) =>
          sum + item.bill.amount,
        0
      );

    plans.push({
      income,
      payday: formatDate(payday),
      amount: income.amount,
      nextPayday: nextPayday
        ? formatDate(nextPayday)
        : null,
      bills: billsForPayday,
      totalBills,
      remaining:
        income.amount - totalBills,
    });

    if (!nextPayday) {
      break;
    }

    payday = nextPayday;
  }

  return plans;
}