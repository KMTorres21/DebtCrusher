import { Bill } from "../types/Bill";
import { Income } from "../types/Income";
import { getBillOccurrences } from "./calendarOccurrences";

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

function addDays(date: Date, days: number): Date {
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
    return addDays(payday, 15);
  }

  if (frequency === "monthly") {
    const originalDay = payday.getDate();

    const next = new Date(
      payday.getFullYear(),
      payday.getMonth() + 1,
      1
    );

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

function getBillsBetweenDates(
  bills: Bill[],
  startDate: Date,
  endDate: Date
): PaydayBill[] {
  const results: PaydayBill[] = [];

  let cursor = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    1
  );

  const lastMonth = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    1
  );

  while (cursor <= lastMonth) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();

    for (const bill of bills) {
      const occurrences = getBillOccurrences(
        bill,
        year,
        month
      );

      for (const occurrence of occurrences) {
        const dueDate = parseDate(occurrence);

        if (
          dueDate > startDate &&
          dueDate <= endDate
        ) {
          results.push({
            bill,
            dueDate: occurrence,
          });
        }
      }
    }

    cursor = new Date(
      year,
      month + 1,
      1
    );
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

  for (let index = 0; index < 6; index++) {
    const nextPayday = getNextPayday(
      payday,
      income.frequency
    );

    const paydayBills =
      nextPayday === null
        ? []
        : getBillsBetweenDates(
            bills,
            payday,
            nextPayday
          );

    const totalBills =
      paydayBills.reduce(
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
      bills: paydayBills,
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

export function buildAllPaydayPlans(
  incomes: Income[],
  bills: Bill[]
): PaydayPlan[] {
  const individualPlans = incomes.flatMap((income) =>
    buildPaydayPlan(income, bills)
  );

  const grouped = new Map<string, PaydayPlan>();

  for (const plan of individualPlans) {
    const existing = grouped.get(plan.payday);

    if (!existing) {
      grouped.set(plan.payday, {
        ...plan,
        income: {
          ...plan.income,
          id: `combined-${plan.payday}`,
          source: "Combined Income",
          amount: plan.amount,
        },
        bills: [...plan.bills],
      });

      continue;
    }

    existing.amount += plan.amount;

    existing.bills.push(...plan.bills);

    existing.bills.sort((a, b) =>
      a.dueDate.localeCompare(b.dueDate)
    );

    existing.totalBills = existing.bills.reduce(
      (sum, item) => sum + item.bill.amount,
      0
    );

    existing.remaining =
      existing.amount - existing.totalBills;
  }

  return Array.from(grouped.values())
    .map((plan) => ({
      ...plan,
      totalBills: plan.bills.reduce(
        (sum, item) => sum + item.bill.amount,
        0
      ),
      remaining:
        plan.amount -
        plan.bills.reduce(
          (sum, item) => sum + item.bill.amount,
          0
        ),
    }))
    .sort((a, b) =>
      a.payday.localeCompare(b.payday)
    );
}

/* Sinking Fund */
export interface BillFunding {
  bill: Bill;
  dueDate: string;
  amount: number;
  payday: string;
}

export function buildBillFundingPlan(
  bills: Bill[],
  paydayPlans: PaydayPlan[]
): BillFunding[] {
  const funding: BillFunding[] = [];

  for (const bill of bills) {
    /*
     * Find every occurrence of this bill
     * represented in the current payday plan.
     */
    const occurrences: PaydayBill[] = [];

    for (const plan of paydayPlans) {
      for (const paydayBill of plan.bills) {
        if (
          paydayBill.bill.id === bill.id
        ) {
          occurrences.push(paydayBill);
        }
      }
    }

    /*
     * Process each bill occurrence separately.
     */
    for (const occurrence of occurrences) {
      const dueDate = parseDate(
        occurrence.dueDate
      );

      /*
       * Find paychecks occurring before
       * this bill's due date.
       */
      const availablePaydays =
        paydayPlans.filter((plan) => {
          const payday = parseDate(
            plan.payday
          );

          return payday < dueDate;
        });

      if (availablePaydays.length === 0) {
        continue;
      }

      /*
       * Spread the bill evenly across the
       * available paychecks.
       */
      const amountPerPaycheck =
        occurrence.bill.amount /
        availablePaydays.length;

      for (const plan of availablePaydays) {
        funding.push({
          bill: occurrence.bill,
          dueDate: occurrence.dueDate,
          amount: amountPerPaycheck,
          payday: plan.payday,
        });
      }
    }
  }

  return funding;
}}