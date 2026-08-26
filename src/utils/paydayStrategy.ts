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

    for (let index = 0; index < count; index++) {
      dates.add(formatDate(payday));

      const nextPayday = getNextPayday(
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

function getCombinedPaycheckAmount(
  incomes: Income[],
  paydayDate: string
): number {
  return incomes.reduce(
    (total, income) => {
      let current = parseDate(
        income.nextPayDate
      );

      if (Number.isNaN(current.getTime())) {
        return total;
      }

      for (let index = 0; index < 12; index++) {
        if (
          formatDate(current) ===
          paydayDate
        ) {
          return total + income.amount;
        }

        const nextPayday =
          getNextPayday(
            current,
            income.frequency
          );

        if (!nextPayday) {
          break;
        }

        current = nextPayday;
      }

      return total;
    },
    0
  );
}

function buildCombinedPaydays(
  incomes: Income[]
): PaydayPlan[] {
  const paydayDates =
    getUniquePaydayDates(incomes);

  return paydayDates.map(
    (payday, index) => {
      const amount =
        getCombinedPaycheckAmount(
          incomes,
          payday
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
        nextPayday:
          paydayDates[index + 1] ??
          null,
        bills: [],
        totalBills: 0,
        remaining: amount,
      };
    }
  );
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
          dueDate >= startDate &&
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

  return results.sort((a, b) =>
    a.dueDate.localeCompare(
      b.dueDate
    )
  );
}

/**
 * Allocate bills using a "latest paycheck first"
 * strategy.
 *
 * Example:
 *
 * Sep 11 paycheck
 * Sep 25 paycheck
 * Oct 1 bill
 *
 * The Oct 1 bill goes to Sep 25.
 *
 * If Sep 25 does not have enough money,
 * the remaining amount is pushed backward
 * into earlier paychecks.
 */
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
    paydayPlans[
      paydayPlans.length - 1
    ].payday
  );

  const occurrences =
    getBillOccurrencesBetweenDates(
      bills,
      firstPayday,
      lastPayday
    );

  /*
   * Track how much money is still available
   * in each paycheck.
   */
  const available = paydayPlans.map(
    (plan) => plan.amount
  );

  for (const occurrence of occurrences) {
    const dueDate =
      parseDate(
        occurrence.dueDate
      );

    let remainingCents =
      Math.round(
        occurrence.bill.amount * 100
      );

    /*
     * Find the latest paycheck BEFORE
     * the bill's due date.
     */
    let latestEligibleIndex = -1;

    for (
      let index = 0;
      index < paydayPlans.length;
      index++
    ) {
      const payday =
        parseDate(
          paydayPlans[index].payday
        );

      if (payday < dueDate) {
        latestEligibleIndex = index;
      }
    }

    /*
     * No paycheck exists before the due date
     * in the projection. Do not put the bill
     * on the due-date paycheck.
     */
    if (latestEligibleIndex === -1) {
      continue;
    }

    /*
     * Work backward from the latest eligible
     * paycheck.
     *
     * This keeps bills as close to their due
     * date as possible and only splits when
     * necessary.
     */
    for (
      let index = latestEligibleIndex;
      index >= 0 && remainingCents > 0;
      index--
    ) {
      const availableCents =
        Math.floor(
          available[index] * 100
        );

      if (availableCents <= 0) {
        continue;
      }

      const allocationCents =
        Math.min(
          remainingCents,
          availableCents
        );

      const allocation =
        allocationCents / 100;

      paydayPlans[index].bills.push({
        bill: occurrence.bill,
        dueDate:
          occurrence.dueDate,
        allocatedAmount: allocation,
      });

      available[index] =
        Math.round(
          (available[index] -
            allocation) *
            100
        ) / 100;

      remainingCents -=
        allocationCents;
    }
  }

  /*
   * Recalculate totals after all allocations.
   */
  return paydayPlans.map(
    (plan) => {
      const billsForPlan = [
        ...plan.bills,
      ].sort((a, b) =>
        a.dueDate.localeCompare(
          b.dueDate
        )
      );

      const totalBills =
        billsForPlan.reduce(
          (sum, item) =>
            sum +
            item.allocatedAmount,
          0
        );

      return {
        ...plan,
        bills: billsForPlan,
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