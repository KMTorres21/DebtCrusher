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

const LARGE_BILL_THRESHOLD = 2 / 3;

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
    const originalDay =
      payday.getDate();

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
      Math.min(
        originalDay,
        lastDay
      )
    );

    return next;
  }

  return null;
}

/*
 * Create all unique paycheck dates.
 *
 * If multiple income sources pay on the
 * same calendar date, they become one
 * combined paycheck.
 */
function getUniquePaydayDates(
  incomes: Income[],
  count = 24
): string[] {
  const dates = new Set<string>();

  for (const income of incomes) {
    let payday = parseDate(
      income.nextPayDate
    );

    if (
      Number.isNaN(
        payday.getTime()
      )
    ) {
      continue;
    }

    for (
      let index = 0;
      index < count;
      index++
    ) {
      dates.add(
        formatDate(payday)
      );

      const next =
        getNextPayday(
          payday,
          income.frequency
        );

      if (!next) {
        break;
      }

      payday = next;
    }
  }

  return Array.from(
    dates
  ).sort();
}

/*
 * lculate how much income occurs on
 * a specific calendar date.
 */
function getCombinedPaycheckAmount(
  incomes: Income[],
  paydayDate: string
): number {
  return incomes.reduce(
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
        let index = 0;
        index < 24;
        index++
      ) {
        if (
          formatDate(
            current
          ) === paydayDate
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
        getCombinedPaycheckAmount(
          incomes,
          payday
        );

      return {
        income: {
          id:
            `combined-${payday}`,
          source:
            "Combined Income",
          amount,
          frequency:
            "onetime",
          nextPayDate:
            payday,
          createdAt: "",
          updatedAt: "",
        },

        payday,

        amount,

        nextPayday:
          paydayDates[
            index + 1
          ] ?? null,

        bills: [],

        totalBills: 0,

        remaining: amount,
      };
    }
  );
}

/*
 * Get actual bill occurrences inside
 * the requested date range.
 */
function getBillOccurrencesBetweenDates(
  bills: Bill[],
  startDate: Date,
  endDate: Date
): PaydayBill[] {
  const results: PaydayBill[] =
    [];

  let cursor = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    1
  );

  const lastMonth =
    new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      1
    );

  while (
    cursor <= lastMonth
  ) {
    const year =
      cursor.getFullYear();

    const month =
      cursor.getMonth();

    for (const bill of bills) {
      const occurrences =
        getBillOccurrences(
          bill,
          year,
          month
        );

      for (
        const occurrence of occurrences
      ) {
        const dueDate =
          parseDate(
            occurrence
          );

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
         * Extra protection against a
         * recurring occurrence being
         * returned for the wrong month.
         */
        if (
          dueDate.getFullYear() !==
            year ||
          dueDate.getMonth() !==
            month
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

  return results.sort(
    (a, b) =>
      a.dueDate.localeCompare(
        b.dueDate
      )
  );
}

/*
 * Find the previous occurrence of
 * the same bill.
 */
function getPreviousOccurrence(
  occurrence: PaydayBill,
  allOccurrences: PaydayBill[]
): Date | null {
  const currentDueDate =
    parseDate(
      occurrence.dueDate
    );

  const previous =
    allOccurrences
      .filter(
        (item) =>
          item.bill.id ===
            occurrence.bill.id &&
          parseDate(
            item.dueDate
          ) < currentDueDate
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

  if (
    previous.length === 0
  ) {
    return null;
  }

  return parseDate(
    previous[0].dueDate
  );
}

/*
 * Find every paycheck that can participate
 * in funding a particular bill occurrence.
 */
function getEligiblePaydays(
  occurrence: PaydayBill,
  previousDueDate: Date | null,
  paydayPlans: PaydayPlan[]
): number[] {
  const dueDate =
    parseDate(
      occurrence.dueDate
    );

  const eligible: number[] =
    [];

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
     * Paycheck on the due date cannot
     * fund the bill.
     */
    if (
      payday >= dueDate
    ) {
      break;
    }

    /*
     * Do not use a paycheck that belongs
     * to the previous recurring bill cycle.
     */
    if (
      previousDueDate &&
      payday <= previousDueDate
    ) {
      continue;
    }

    eligible.push(index);
  }

  return eligible;
}

/*
 * Allocate a large bill proportionally
 * across all eligible paychecks.
 */
function allocateProportionally(
  occurrence: PaydayBill,
  eligibleIndexes: number[],
  paydayPlans: PaydayPlan[],
  availableCents: number[]
): void {
  if (
    eligibleIndexes.length ===
    0
  ) {
    return;
  }

  const billCents =
    Math.round(
      occurrence.bill.amount *
        100
    );

  /*
   * Calculate the income represented by
   * the eligible paychecks.
   */
  const totalEligibleIncome =
    eligibleIndexes.reduce(
      (sum, index) =>
        sum +
        paydayPlans[index]
          .amount,
      0
    );

  if (
    totalEligibleIncome <= 0
  ) {
    return;
  }

  /*
   * If the bill is not actually large,
   * don't use proportional allocation.
   */
  if (
    occurrence.bill.amount <=
    totalEligibleIncome *
      LARGE_BILL_THRESHOLD
  ) {
    return;
  }

  let allocatedCents = 0;

  eligibleIndexes.forEach(
    (index, position) => {
      const paycheckAmount =
        paydayPlans[index]
          .amount;

      /*
       * The percentage is based on the
       * paycheck's share of total income
       * in this funding cycle.
       */
      const percentage =
        paycheckAmount /
        totalEligibleIncome;

      let allocationCents =
        Math.round(
          billCents *
            percentage
        );

      /*
       * Never allocate more than what
       * remains available in this paycheck.
       */
      allocationCents =
        Math.min(
          allocationCents,
          availableCents[index]
        );

      /*
       * Last eligible paycheck receives
       * the remaining amount after
       * rounding.
       */
      if (
        position ===
        eligibleIndexes.length - 1
      ) {
        const remainingBillCents =
          billCents -
          allocatedCents;

        const possible =
          Math.min(
            remainingBillCents +
              allocatedCents,
            availableCents[index]
          );

        allocationCents =
          Math.min(
            possible,
            remainingBillCents
          );
      }

      if (
        allocationCents <= 0
      ) {
        return;
      }

      paydayPlans[index].bills.push(
        {
          bill: occurrence.bill,
          dueDate:
            occurrence.dueDate,
          allocatedAmount:
            allocationCents /
            100,
        }
      );

      availableCents[index] -=
        allocationCents;

      allocatedCents +=
        allocationCents;
    }
  );

  /*
   * If rounding or limited paycheck
   * availability left part of the bill
   * unfunded, fill the remainder using
   * available eligible paychecks.
   */
  let remainingCents =
    billCents -
    eligibleIndexes.reduce(
      (sum, index) => {
        const allocations =
          paydayPlans[index].bills
            .filter(
              (item) =>
                item.bill.id ===
                  occurrence.bill.id &&
                item.dueDate ===
                  occurrence.dueDate
            )
            .reduce(
              (total, item) =>
                total +
                Math.round(
                  item.allocatedAmount *
                    100
                ),
              0
            );

        return sum + allocations;
      },
      0
    );

  if (
    remainingCents <= 0
  ) {
    return;
  }

  /*
   * Add any remaining cents starting
   * from the latest eligible paycheck.
   */
  for (
    let position =
      eligibleIndexes.length -
      1;
    position >= 0 &&
    remainingCents > 0;
    position--
  ) {
    const index =
      eligibleIndexes[position];

    const available =
      availableCents[index];

    if (available <= 0) {
      continue;
    }

    const allocation =
      Math.min(
        remainingCents,
        available
      );

    paydayPlans[index].bills.push(
      {
        bill: occurrence.bill,
        dueDate:
          occurrence.dueDate,
        allocatedAmount:
          allocation / 100,
      }
    );

    availableCents[index] -=
      allocation;

    remainingCents -=
      allocation;
  }
}

/*
 * Normal bill allocation.
 *
 * Put the whole bill on the latest
 * paycheck before the due date unless
 * that paycheck doesn't have enough.
 */
function allocateNormally(
  occurrence: PaydayBill,
  eligibleIndexes: number[],
  paydayPlans: PaydayPlan[],
  availableCents: number[]
): void {
  if (
    eligibleIndexes.length ===
    0
  ) {
    return;
  }

  let remainingCents =
    Math.round(
      occurrence.bill.amount *
        100
    );

  /*
   * Work backward so the bill is funded
   * as close to its due date as possible.
   */
  for (
    let position =
      eligibleIndexes.length -
      1;
    position >= 0 &&
    remainingCents > 0;
    position--
  ) {
    const index =
      eligibleIndexes[position];

    const available =
      availableCents[index];

    if (available <= 0) {
      continue;
    }

    const allocation =
      Math.min(
        remainingCents,
        available
      );

    paydayPlans[index].bills.push(
      {
        bill: occurrence.bill,
        dueDate:
          occurrence.dueDate,
        allocatedAmount:
          allocation / 100,
      }
    );

    availableCents[index] -=
      allocation;

    remainingCents -=
      allocation;
  }
}

function allocateBills(
  bills: Bill[],
  paydayPlans: PaydayPlan[]
): PaydayPlan[] {
  if (
    paydayPlans.length ===
    0
  ) {
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

  const occurrences =
    getBillOccurrencesBetweenDates(
      bills,
      firstPayday,
      lastPayday
    );

  /*
   * Available paycheck money.
   */
  const availableCents =
    paydayPlans.map(
      (plan) =>
        Math.round(
          plan.amount * 100
        )
    );

  /*
   * Process occurrences in due-date order.
   */
  for (const occurrence of occurrences) {
    const dueDate =
      parseDate(
        occurrence.dueDate
      );

    const previousDueDate =
      getPreviousOccurrence(
        occurrence,
        occurrences
      );

    const eligibleIndexes =
      getEligiblePaydays(
        occurrence,
        previousDueDate,
        paydayPlans
      );

    if (
      eligibleIndexes.length ===
      0
    ) {
      continue;
    }

    /*
     * Calculate the income available
     * in this bill's funding cycle.
     */
    const cycleIncome =
      eligibleIndexes.reduce(
        (sum, index) =>
          sum +
          paydayPlans[index]
            .amount,
        0
      );

    const isLargeBill =
      occurrence.bill.amount >
      cycleIncome *
        LARGE_BILL_THRESHOLD;

    if (isLargeBill) {
      allocateProportionally(
        occurrence,
        eligibleIndexes,
        paydayPlans,
        availableCents
      );
    } else {
      allocateNormally(
        occurrence,
        eligibleIndexes,
        paydayPlans,
        availableCents
      );
    }
  }

  return paydayPlans.map(
    (plan) => {
      const billsForPlan = [
        ...plan.bills,
      ].sort(
        (a, b) =>
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

      const roundedTotal =
        Math.round(
          totalBills * 100
        ) / 100;

      return {
        ...plan,

        bills:
          billsForPlan,

        totalBills:
          roundedTotal,

        remaining:
          Math.round(
            (plan.amount -
              roundedTotal) *
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