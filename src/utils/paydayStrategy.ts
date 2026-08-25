import { Bill } from "../types/Bill";
import { Income } from "../types/Income";
import { getBillOccurrences } from "./calendarOccurrences";

export interface PaydayBill {
  bill: Bill;
  dueDate: string;
  allocatedAmount: number;
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

function getBillOccurrencesBetweenDates(
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
            allocatedAmount: 0,
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

  return results;
}

function getPaydayDates(
  incomes: Income[],
  count = 12
): string[] {
  const dates = new Set<string>();

  for (const income of incomes) {
    let payday = parseDate(
      income.nextPayDate
    );

    if (Number.isNaN(payday.getTime())) {
      continue;
    }

    for (let index = 0; index < count; index++) {
      dates.add(formatDate(payday));

      const next = getNextPayday(
        payday,
        income.frequency
      );

      if (!next) {
        break;
      }

      payday = next;
    }
  }

  return Array.from(dates).sort();
}

function buildCombinedPaydays(
  incomes: Income[]
): PaydayPlan[] {
  const dates = getPaydayDates(incomes);

  return dates.map((payday) => {
    const amount = incomes.reduce(
      (total, income) => {
        let current = parseDate(
          income.nextPayDate
        );

        if (Number.isNaN(current.getTime())) {
          return total;
        }

        for (let index = 0; index < 12; index++) {
          if (
            formatDate(current) === payday
          ) {
            return total + income.amount;
          }

          const next = getNextPayday(
            current,
            income.frequency
          );

          if (!next) {
            break;
          }

          current = next;
        }

        return total;
      },
      0
    );

    return {
      income: {
        id: `combined-${payday}`,
        source: "Combined Income",
        amount,
        frequency: "onetime",
        nextPayDate: payday,
        createdAt: "",
        updatedAt: "",
      },
      payday,
      amount,
      nextPayday: null,
      bills: [],
      totalBills: 0,
      remaining: amount,
    };
  });
}

function allocateBills(
  bills: Bill[],
  paydayPlans: PaydayPlan[]
): PaydayPlan[] {
  const occurrences =
    getBillOccurrencesBetweenDates(
      bills,
      parseDate(
        paydayPlans[0]?.payday ??
          formatDate(new Date())
      ),
      parseDate(
        paydayPlans[
          paydayPlans.length - 1
        ]?.payday ??
          formatDate(new Date())
      )
    );

  for (const occurrence of occurrences) {
    const dueDate = parseDate(
      occurrence.dueDate
    );

    const eligiblePaydays =
      paydayPlans.filter((plan) => {
        const payday = parseDate(
          plan.payday
        );

        return payday < dueDate;
      });

    if (eligiblePaydays.length === 0) {
      /*
       * If there is no paycheck before the
       * due date, put the bill on the first
       * available paycheck so it is not lost.
       */
      const firstPlan = paydayPlans.find(
        (plan) =>
          parseDate(plan.payday) <=
          dueDate
      );

      if (firstPlan) {
        firstPlan.bills.push({
          ...occurrence,
          allocatedAmount:
            occurrence.bill.amount,
        });
      }

      continue;
    }

    /*
     * Spread the actual bill amount evenly
     * across every paycheck before the due date.
     *
     * The final paycheck receives any rounding
     * difference so the allocations always add
     * up exactly to the bill amount.
     */
    const baseAmount =
      Math.floor(
        (occurrence.bill.amount /
          eligiblePaydays.length) *
          100
      ) / 100;

    let allocated = 0;

    eligiblePaydays.forEach(
      (plan, index) => {
        const amount =
          index ===
          eligiblePaydays.length - 1
            ? Math.round(
                (occurrence.bill.amount -
                  allocated) *
                  100
              ) / 100
            : baseAmount;

        allocated += amount;

        plan.bills.push({
          bill: occurrence.bill,
          dueDate: occurrence.dueDate,
          allocatedAmount: amount,
        });
      }
    );
  }

  return paydayPlans.map((plan) => {
    const totalBills =
      plan.bills.reduce(
        (sum, item) =>
          sum + item.allocatedAmount,
        0
      );

    return {
      ...plan,
      totalBills,
      remaining:
        plan.amount - totalBills,
    };
  });
}

export function buildAllPaydayPlans(
  incomes: Income[],
  bills: Bill[]
): PaydayPlan[] {
  const paydayPlans =
    buildCombinedPaydays(incomes);

  return allocateBills(
    bills,
    paydayPlans
  );
}