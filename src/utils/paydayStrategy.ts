import { Bill } from "../types/Bill";
import { Income } from "../types/Income";
import { getBillOccurrences } from "./calendarOccurrences";

import {
  BillFundingMode,
  PaydayStrategySettings,
  DEFAULT_PAYDAY_STRATEGY_SETTINGS,
} from "../types/PaydayStrategySettings";

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

const STORAGE_KEY =
  "debtcrusher-payday-strategy-settings";

function parseDate(
  dateString: string
): Date {
  return new Date(
    `${dateString}T12:00:00`
  );
}

function formatDate(
  date: Date
): string {
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
  if (
    frequency === "onetime"
  ) {
    return null;
  }

  if (
    frequency === "weekly"
  ) {
    return addDays(payday, 7);
  }

  if (
    frequency === "biweekly"
  ) {
    return addDays(payday, 14);
  }

  if (
    frequency === "semimonthly"
  ) {
    return addDays(payday, 15);
  }

  if (
    frequency === "monthly"
  ) {
    const originalDay =
      payday.getDate();

    const next = new Date(
      payday.getFullYear(),
      payday.getMonth() + 1,
      1
    );

    const lastDay =
      new Date(
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
 * Read the same settings saved by
 * usePaydayStrategySettings().
 */
function getStrategySettings():
  PaydayStrategySettings {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return {
        ...DEFAULT_PAYDAY_STRATEGY_SETTINGS,
      };
    }

    const parsed =
      JSON.parse(stored);

    return {
      ...DEFAULT_PAYDAY_STRATEGY_SETTINGS,
      ...parsed,
    };
  } catch {
    return {
      ...DEFAULT_PAYDAY_STRATEGY_SETTINGS,
    };
  }
}

/*
 * Generate all unique paycheck dates.
 *
 * Paychecks occurring on the same
 * calendar date are combined.
 */
function getUniquePaydayDates(
  incomes: Income[],
  count = 24
): string[] {
  const dates =
    new Set<string>();

  for (
    const income of incomes
  ) {
    let payday =
      parseDate(
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
 * Calculate the total income
 * occurring on a calendar date.
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
    (
      payday,
      index
    ) => {
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
 * Get actual bill occurrences
 * inside the projection.
 */
function getBillOccurrencesBetweenDates(
  bills: Bill[],
  startDate: Date,
  endDate: Date
): PaydayBill[] {
  const results:
    PaydayBill[] = [];

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

    for (
      const bill of bills
    ) {
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

          dueDate:
            occurrence,

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
 * Find the previous occurrence
 * of the same bill.
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
 * Find paychecks between the
 * previous bill occurrence and
 * the current due date.
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

  const eligible:
    number[] = [];

  for (
    let index = 0;
    index <
      paydayPlans.length;
    index++
  ) {
    const payday =
      parseDate(
        paydayPlans[index]
          .payday
      );

    /*
     * Never use the paycheck
     * occurring on the due date.
     */
    if (
      payday >= dueDate
    ) {
      break;
    }

    /*
     * Do not cross the previous
     * recurring bill occurrence.
     */
    if (
      previousDueDate &&
      payday <=
        previousDueDate
    ) {
      continue;
    }

    eligible.push(index);
  }

  return eligible;
}

/*
 * Calculate the total income
 * represented by eligible paychecks.
 */
function getEligibleIncome(
  eligibleIndexes: number[],
  paydayPlans: PaydayPlan[]
): number {
  return eligibleIndexes.reduce(
    (total, index) =>
      total +
      paydayPlans[index]
        .amount,
    0
  );
}

/*
 * Determine whether a bill
 * should be split.
 */
function shouldSplitBill(
  occurrence: PaydayBill,
  eligibleIndexes: number[],
  paydayPlans: PaydayPlan[],
  settings: PaydayStrategySettings
): boolean {
  if (
    settings.billFundingMode ===
    "always-split"
  ) {
    return true;
  }

  if (
    settings.billFundingMode ===
    "together"
  ) {
    return false;
  }

  const eligibleIncome =
    getEligibleIncome(
      eligibleIndexes,
      paydayPlans
    );

  if (
    eligibleIncome <= 0
  ) {
    return false;
  }

  /*
   * Convert the configured percentage
   * to a decimal.
   */
  const threshold =
    Math.min(
      100,
      Math.max(
        1,
        settings.largeBillThreshold
      )
    ) / 100;

  return (
    occurrence.bill.amount >
    eligibleIncome *
      threshold
  );
}

/*
 * Allocate a bill proportionally.
 *
 * The allocation is based on each
 * paycheck's share of the eligible
 * funding-cycle income.
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

  const totalIncome =
    getEligibleIncome(
      eligibleIndexes,
      paydayPlans
    );

  if (
    totalIncome <= 0
  ) {
    return;
  }

  let remainingCents =
    billCents;

  /*
   * Allocate in chronological
   * order.
   */
  for (
    let position = 0;
    position <
      eligibleIndexes.length;
    position++
  ) {
    const index =
      eligibleIndexes[position];

    const paycheckAmount =
      paydayPlans[index]
        .amount;

    let allocationCents: number;

    if (
      position ===
      eligibleIndexes.length - 1
    ) {
      /*
       * Final paycheck receives
       * the exact remainder so
       * rounding never changes
       * the bill total.
       */
      allocationCents =
        remainingCents;
    } else {
      const proportion =
        paycheckAmount /
        totalIncome;

      allocationCents =
        Math.round(
          billCents *
            proportion
        );

      allocationCents =
        Math.min(
          allocationCents,
          remainingCents
        );
    }

    /*
     * Respect available paycheck
     * money.
     */
    allocationCents =
      Math.min(
        allocationCents,
        availableCents[index]
      );

    if (
      allocationCents <= 0
    ) {
      continue;
    }

    paydayPlans[index].bills.push(
      {
        bill:
          occurrence.bill,

        dueDate:
          occurrence.dueDate,

        allocatedAmount:
          allocationCents /
          100,
      }
    );

    availableCents[index] -=
      allocationCents;

    remainingCents -=
      allocationCents;
  }

  /*
   * If a paycheck did not have
   * enough available money,
   * continue allocating the
   * remainder across the other
   * eligible paychecks.
   */
  if (
    remainingCents > 0
  ) {
    for (
      let position =
        eligibleIndexes.length -
        1;
      position >= 0 &&
      remainingCents > 0;
      position--
    ) {
      const index =
        eligibleIndexes[
          position
        ];

      const available =
        availableCents[
          index
        ];

      if (
        available <= 0
      ) {
        continue;
      }

      const allocation =
        Math.min(
          remainingCents,
          available
        );

      paydayPlans[index].bills.push(
        {
          bill:
            occurrence.bill,

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
}

/*
 * Keep a normal bill together
 * whenever possible.
 */
function allocateTogether(
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
   * Start with the latest
   * paycheck before the due date.
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
      eligibleIndexes[
        position
      ];

    const available =
      availableCents[index];

    if (
      available <= 0
    ) {
      continue;
    }

    const allocation =
      Math.min(
        remainingCents,
        available
      );

    paydayPlans[index].bills.push(
      {
        bill:
          occurrence.bill,

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
      paydayPlans[0]
        .payday
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
   * Every paycheck starts with
   * its full available amount.
   */
  const availableCents =
    paydayPlans.map(
      (plan) =>
        Math.round(
          plan.amount * 100
        )
    );

  const settings =
    getStrategySettings();

  /*
   * Bills are processed in due-date
   * order so earlier obligations
   * get priority.
   */
  for (
    const occurrence of
      occurrences
  ) {
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

    const split =
      shouldSplitBill(
        occurrence,
        eligibleIndexes,
        paydayPlans,
        settings
      );

    if (split) {
      allocateProportionally(
        occurrence,
        eligibleIndexes,
        paydayPlans,
        availableCents
      );
    } else {
      allocateTogether(
        occurrence,
        eligibleIndexes,
        paydayPlans,
        availableCents
      );
    }
  }

  /*
   * Recalculate totals after
   * every allocation.
   */
  return paydayPlans.map(
    (plan) => {
      const bills =
        [...plan.bills].sort(
          (a, b) =>
            a.dueDate.localeCompare(
              b.dueDate
            )
        );

      const totalBills =
        bills.reduce(
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

        bills,

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