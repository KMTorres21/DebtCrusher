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

function addDays(
  date: Date,
  days: number
): Date {
  const result = new Date(date);
  result.setDate(
    result.getDate() + days
  );
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
      const occurrences =
        getBillOccurrences(
          bill,
          year,
          month
        );

      for (const occurrence of occurrences) {
        const dueDate =
          parseDate(occurrence);

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

function getUniquePaydayDates(
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

    for (
      let index = 0;
      index < count;
      index++
    ) {
      dates.add(formatDate(payday));

      const nextPayday =
        getNextPayday(
          payday,
          income.frequency
        );

      if (!nextPayday) {
        break;
      }

      payday = nextPayday;
    }
  }

  return Array.from(dates).sort();
}

function buildCombinedPaydays(
  incomes: Income[]
): PaydayPlan[] {
  const paydayDates =
    getUniquePaydayDates(
      incomes
    );

  return paydayDates.map(
    (payday, index) => {
      const amount =
        incomes.reduce(
          (total, income) => {
            let current =
              parseDate(
                income.nextPayDate
              );

            if (
              Number.isNaN(
                current.getTime()
              )
            ) {
              return total;
            }

            for (
              let occurrence = 0;
              occurrence < 12;
              occurrence++
            ) {
              if (
                formatDate(
                  current
                ) === payday
              ) {
                return (
                  total +
                  income.amount
                );
              }

              const next =
                getNextPayday(
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

      const nextPayday =
        paydayDates[index + 1] ??
        null;

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
        nextPayday,
        bills: [],
        totalBills: 0,
        remaining: amount,
      };
    }
  );
}

function getPreviousBillOccurrence(
  bill: Bill,
  dueDate: Date,
  bills: Bill[],
  searchStart: Date
): Date | null {
  if (!bill.recurring) {
    return null;
  }

  const previousSearchStart =
    new Date(searchStart);

  previousSearchStart.setMonth(
    previousSearchStart.getMonth() - 2
  );

  const occurrences =
    getBillOccurrencesBetweenDates(
      bills,
      previousSearchStart,
      dueDate
    );

  const previousOccurrences =
    occurrences
      .filter(
        (occurrence) =>
          occurrence.bill.id ===
            bill.id &&
          parseDate(
            occurrence.dueDate
          ) < dueDate
      )
      .map((occurrence) =>
        parseDate(
          occurrence.dueDate
        )
      )
      .sort(
        (a, b) =>
          b.getTime() - a.getTime()
      );

  return (
    previousOccurrences[0] ??
    null
  );
}

function allocateBills(
  bills: Bill[],
  paydayPlans: PaydayPlan[]
): PaydayPlan[] {
  if (paydayPlans.length === 0) {
    return [];
  }

  const firstPayday = parseDate(
    paydayPlans[0].payday
  );

  const lastPayday = parseDate(
    paydayPlans[paydayPlans.length - 1].payday
  );

  const occurrences =
    getBillOccurrencesBetweenDates(
      bills,
      firstPayday,
      lastPayday
    );

  /*
   * Process bills in due-date order.
   */
  occurrences.sort((a, b) =>
    a.dueDate.localeCompare(b.dueDate)
  );

  for (const occurrence of occurrences) {
    const dueDate = parseDate(
      occurrence.dueDate
    );

    /*
     * Find the latest paycheck BEFORE the
     * bill's due date.
     *
     * A paycheck on the due date is NOT used.
     */
    const eligiblePaydays =
      paydayPlans.filter((plan) => {
        const payday = parseDate(
          plan.payday
        );

        return payday < dueDate;
      });

    if (eligiblePaydays.length === 0) {
      continue;
    }

    /*
     * The latest paycheck before the due date
     * gets the ENTIRE bill.
     */
    const assignedPlan =
      eligiblePaydays[
        eligiblePaydays.length - 1
      ];

    /*
     * Prevent the same bill occurrence from
     * being added more than once.
     */
    const alreadyAssigned =
      assignedPlan.bills.some(
        (item) =>
          item.bill.id ===
            occurrence.bill.id &&
          item.dueDate ===
            occurrence.dueDate
      );

    if (alreadyAssigned) {
      continue;
    }

    assignedPlan.bills.push({
      bill: occurrence.bill,
      dueDate: occurrence.dueDate,
      allocatedAmount:
        occurrence.bill.amount,
    });
  }

  /*
   * Recalculate each paycheck's totals.
   */
  return paydayPlans.map(
    (plan) => {
      const sortedBills = [
        ...plan.bills,
      ].sort((a, b) =>
        a.dueDate.localeCompare(
          b.dueDate
        )
      );

      const totalBills =
        sortedBills.reduce(
          (sum, item) =>
            sum +
            item.allocatedAmount,
          0
        );

      return {
        ...plan,
        bills: sortedBills,
        totalBills,
        remaining:
          Math.round(
            (plan.amount -
              totalBills) *
              100
          ) / 100,
      };
    }
  );
}

export function buildAllPaydayPlans(
  incomes: Income[],
  bills: Bill[]
): PaydayPlan[] {
  const paydayPlans =
    buildCombinedPaydays(
      incomes
    );

  return allocateBills(
    bills,
    paydayPlans
  );
}