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

/*
 * Get all unique paycheck dates.
 * Paychecks falling on the same calendar date
 * are combined into one paycheck.
 */
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

/*
 * Calculate the total income occurring on
 * one calendar payday.
 */
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

/*
 * IMPORTANT:
 *
 * This function only returns bill occurrences
 * whose ACTUAL occurrence date falls inside
 * the requested date range.
 *
 * This prevents something like:
 *
 * Mortgage due Aug 1, 2027
 *
 * from appearing in an Oct 2026 paycheck.
 */
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

        /*
         * Reject anything outside the requested
         * projection window.
         */
        if (
          Number.isNaN(
            dueDate.getTime()
          )
        ) {
          continue;
        }

        if (
          dueDate < startDate ||
          dueDate > endDate
        ) {
          continue;
        }

        /*
         * Extra protection:
         *
         * The occurrence must actually belong
         * to the month we asked calendarOccurrences
         * to generate.
         */
        if (
          dueDate.getFullYear() !== year ||
          dueDate.getMonth() !== month
        ) {
          continue;
        }

        results.push({
          bill,
          dueDate: occurrence,
          allocatedAmount: 0,
        });
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

/*
 * Find the previous occurrence of the SAME bill.
 *
 * This creates an individual funding window
 * for every recurring occurrence.
 */
function getPreviousOccurrence(
  bill: Bill,
  dueDate: Date,
  allOccurrences: PaydayBill[]
): Date | null {
  const previous = allOccurrences
    .filter(
      (occurrence) =>
        occurrence.bill.id ===
          bill.id &&
        parseDate(
          occurrence.dueDate
        ) < dueDate
    )
    .sort(
      (a, b) =>
        parseDate(
          b.dueDate
        ).getTime() -
        parseDate(
          a.dueDate
        ).getTime()
    );

  return previous.length > 0
    ? parseDate(
        previous[0].dueDate
      )
    : null;
}

/*
 * Allocate bills.
 *
 * Rules:
 *
 * 1. A bill is allocated only to paychecks
 *    BEFORE its due date.
 *
 * 2. A recurring bill occurrence has its
 *    own funding window.
 *
 * 3. Future occurrences cannot consume
 *    money from today's paycheck.
 *
 * 4. We start with the latest paycheck
 *    before the due date.
 *
 * 5. We move backward only if that paycheck
 *    doesn't have enough available money.
 *
 * 6. Same-day paychecks are already combined.
 */
function allocateBills(
  bills: Bill[],
  paydayPlans: PaydayPlan[]
): PaydayPlan[] {
  if (paydayPlans.length === 0) {
    return [];
  }

  const firstPayday =
    parseDate(
      paydayPlans[0].payday
    );

  const lastPayday =
    parseDate(
      paydayPlans[
        paydayPlans.length - 1
      ].payday
    );

  /*
   * Generate ONLY occurrences that actually
   * exist inside the projection.
   */
  const occurrences =
    getBillOccurrencesBetweenDates(
      bills,
      firstPayday,
      lastPayday
    );

  /*
   * Available money in each paycheck.
   */
  const availableCents =
    paydayPlans.map(
      (plan) =>
        Math.round(
          plan.amount * 100
        )
    );

  /*
   * Process bills chronologically.
   */
  for (const occurrence of occurrences) {
    const dueDate =
      parseDate(
        occurrence.dueDate
      );

    /*
     * Find the previous occurrence of this
     * SAME bill.
     */
    const previousDueDate =
      getPreviousOccurrence(
        occurrence.bill,
        dueDate,
        occurrences
      );

    /*
     * Find the latest paycheck before
     * this bill's due date.
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

      /*
       * Must be BEFORE the due date.
       */
      if (payday >= dueDate) {
        break;
      }

      /*
       * For recurring bills, the paycheck
       * must also occur AFTER the previous
       * occurrence.
       */
      if (
        previousDueDate &&
        payday <= previousDueDate
      ) {
        continue;
      }

      latestEligibleIndex =
        index;
    }

    /*
     * No valid paycheck exists in the
     * funding window.
     *
     * Do not put the bill on the due-date
     * paycheck.
     */
    if (
      latestEligibleIndex === -1
    ) {
      continue;
    }

    let remainingCents =
      Math.round(
        occurrence.bill.amount * 100
      );

    /*
     * Work backward from the latest
     * eligible paycheck.
     */
    for (
      let index =
        latestEligibleIndex;
      index >= 0 &&
      remainingCents > 0;
      index--
    ) {
      const payday =
        parseDate(
          paydayPlans[index].payday
        );

      /*
       * Never cross the previous occurrence
       * of a recurring bill.
       */
      if (
        previousDueDate &&
        payday <= previousDueDate
      ) {
        break;
      }

      const available =
        availableCents[index];

      if (available <= 0) {
        continue;
      }

      const allocationCents =
        Math.min(
          remainingCents,
          available
        );

      paydayPlans[index].bills.push({
        bill: occurrence.bill,
        dueDate:
          occurrence.dueDate,
        allocatedAmount:
          allocationCents / 100,
      });

      availableCents[index] -=
        allocationCents;

      remainingCents -=
        allocationCents;
    }
  }

  /*
   * Recalculate each paycheck.
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
        totalBills:
          Math.round(
            totalBills * 100
          ) / 100,
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