import { Bill } from "../types/Bill";
import { Debt } from "../types/Debt";
import { Income } from "../types/Income";
import { getBillOccurrences } from "./calendarOccurrences";

import {
  PaydayStrategySettings,
  DEFAULT_PAYDAY_STRATEGY_SETTINGS,
} from "../types/PaydayStrategySettings";

export type PaydayObligationType =
  | "bill"
  | "debt";

export interface PaydayBill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  type: PaydayObligationType;
  bill?: Bill;
  debt?: Debt;
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

/*Payday Safety-Net Setting*/
export type PaydayBillFundingMode =
  | "together"
  | "large-bills"
  | "always-split";

export interface PaydayStrategySettings {
  billFundingMode: PaydayBillFundingMode;
  largeBillThreshold: number;

  debtSafetyNetEnabled: boolean;
  debtSafetyNetAmount: number;
}

export const DEFAULT_PAYDAY_STRATEGY_SETTINGS: PaydayStrategySettings = {
  billFundingMode: "large-bills",
  largeBillThreshold: 67,

  debtSafetyNetEnabled: false,
  debtSafetyNetAmount: 500,
};

const STORAGE_KEY =
  "debtcrusher-payday-strategy-settings";

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

function getStrategySettings():
  PaydayStrategySettings {
  try {
    const stored =
      localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return {
        ...DEFAULT_PAYDAY_STRATEGY_SETTINGS,
      };
    }

    return {
      ...DEFAULT_PAYDAY_STRATEGY_SETTINGS,
      ...JSON.parse(stored),
    };
  } catch {
    return {
      ...DEFAULT_PAYDAY_STRATEGY_SETTINGS,
    };
  }
}

/*
 * Build all unique paycheck dates.
 *
 * If multiple income sources pay on the
 * same date, they become one combined paycheck.
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

    if (Number.isNaN(payday.getTime())) {
      continue;
    }

    for (
      let index = 0;
      index < count;
      index++
    ) {
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

function getCombinedPaycheckAmount(
  incomes: Income[],
  paydayDate: string
): number {
  return incomes.reduce(
    (total, income) => {
      let current = parseDate(
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
          formatDate(current) ===
          paydayDate
        ) {
          return (
            total +
            income.amount
          );
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
 * Create a bill obligation.
 */
function createBillObligation(
  bill: Bill,
  dueDate: string
): PaydayBill {
  return {
    id: `bill:${bill.id}:${dueDate}`,
    name: bill.name,
    amount: bill.amount,
    dueDate,
    type: "bill",
    bill,
    allocatedAmount: 0,
  };
}

/*
 * Create a debt-payment obligation.
 */
function createDebtObligation(
  debt: Debt,
  dueDate: string
): PaydayBill {
  return {
    id: `debt:${debt.id}:${dueDate}`,
    name: debt.name,
    amount: debt.minimumPayment,
    dueDate,
    type: "debt",
    debt,
    allocatedAmount: 0,
  };
}

/*
 * Generate bill occurrences.
 */
function getBillObligations(
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

        results.push(
          createBillObligation(
            bill,
            occurrence
          )
        );
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

/*
 * Generate monthly debt minimum-payment
 * occurrences.
 */
function getDebtObligations(
  debts: Debt[],
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

    for (const debt of debts) {
      if (debt.minimumPayment <= 0) {
        continue;
      }

      const originalDueDate =
        parseDate(debt.dueDate);

      if (
        Number.isNaN(
          originalDueDate.getTime()
        )
      ) {
        continue;
      }

      const originalDay =
        originalDueDate.getDate();

      const lastDay = new Date(
        year,
        month + 1,
        0
      ).getDate();

      const day = Math.min(
        originalDay,
        lastDay
      );

      const dueDate = new Date(
        year,
        month,
        day,
        12
      );

      if (
        dueDate < startDate ||
        dueDate > endDate
      ) {
        continue;
      }

      results.push(
        createDebtObligation(
          debt,
          formatDate(dueDate)
        )
      );
    }

    cursor = new Date(
      year,
      month + 1,
      1
    );
  }

  return results;
}

function getAllObligations(
  bills: Bill[],
  debts: Debt[],
  startDate: Date,
  endDate: Date
): PaydayBill[] {
  return [
    ...getBillObligations(
      bills,
      startDate,
      endDate
    ),
    ...getDebtObligations(
      debts,
      startDate,
      endDate
    ),
  ].sort(
    (a, b) =>
      a.dueDate.localeCompare(
        b.dueDate
      )
  );
}

/*
 * Identify the previous occurrence
 * of the SAME obligation.
 *
 * We use the full obligation ID prefix
 * instead of split("-"), which is safer
 * when IDs contain hyphens.
 */
function getPreviousOccurrence(
  occurrence: PaydayBill,
  allOccurrences: PaydayBill[]
): Date | null {
  const currentDueDate =
    parseDate(
      occurrence.dueDate
    );

  const occurrenceKey =
    occurrence.id.substring(
      0,
      occurrence.id.lastIndexOf(":")
    );

  const previous =
    allOccurrences
      .filter(
        (item) => {
          const itemKey =
            item.id.substring(
              0,
              item.id.lastIndexOf(":")
            );

          return (
            itemKey === occurrenceKey &&
            parseDate(
              item.dueDate
            ) < currentDueDate
          );
        }
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
 * Find every paycheck that can fund
 * an obligation before it is due.
 *
 * IMPORTANT:
 * The paycheck immediately before the
 * due date is included.
 *
 * Example:
 *
 * Aug 28
 * Sep 1
 * Sep 11
 * Sep 16 due date
 *
 * All three are eligible.
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

  const eligible: number[] = [];

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
     * A paycheck on the actual due date
     * is considered usable.
     */
    if (payday > dueDate) {
      break;
    }

    /*
     * Do not use money from the previous
     * recurring obligation cycle.
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

function getEligibleIncome(
  eligibleIndexes: number[],
  paydayPlans: PaydayPlan[]
): number {
  return eligibleIndexes.reduce(
    (total, index) =>
      total +
      paydayPlans[index].amount,
    0
  );
}

/*
 * Determine whether an obligation
 * should be split.
 */
function shouldSplitObligation(
  obligation: PaydayBill,
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

  if (eligibleIncome <= 0) {
    return false;
  }

  const threshold =
    Math.min(
      100,
      Math.max(
        1,
        settings.largeBillThreshold
      )
    ) / 100;

  return (
    obligation.amount >=
    eligibleIncome * threshold
  );
}

/*
 * Proportionally distribute an obligation
 * across ALL eligible paychecks.
 *
 * This is the important part that allows
 * Aug 28 to participate in the Sep 16
 * obligation.
 */
function allocateProportionally(
  obligation: PaydayBill,
  eligibleIndexes: number[],
  paydayPlans: PaydayPlan[],
  availableCents: number[]
): void {
  if (
    eligibleIndexes.length === 0
  ) {
    return;
  }

  const amountCents =
    Math.round(
      obligation.amount * 100
    );

  const totalEligibleIncome =
    getEligibleIncome(
      eligibleIndexes,
      paydayPlans
    );

  if (totalEligibleIncome <= 0) {
    return;
  }

  /*
   * First calculate the theoretical
   * proportional allocations.
   */
  const allocations =
    eligibleIndexes.map(
      (index) => {
        return Math.floor(
          amountCents *
            (
              paydayPlans[index]
                .amount /
              totalEligibleIncome
            )
        );
      }
    );

  /*
   * Distribute the rounding cents.
   */
  let allocatedTotal =
    allocations.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  let roundingIndex =
    allocations.length - 1;

  while (
    allocatedTotal <
      amountCents &&
    roundingIndex >= 0
  ) {
    allocations[
      roundingIndex
    ] += 1;

    allocatedTotal += 1;

    roundingIndex--;

    if (
      roundingIndex < 0 &&
      allocatedTotal <
        amountCents
    ) {
      roundingIndex =
        allocations.length - 1;
    }
  }

  /*
   * Apply allocations while respecting
   * actual available paycheck capacity.
   */
  let remainingCents =
    amountCents;

  for (
    let position = 0;
    position <
      eligibleIndexes.length;
    position++
  ) {
    const index =
      eligibleIndexes[position];

    const allocation =
      Math.min(
        allocations[position],
        availableCents[index],
        remainingCents
      );

    if (allocation <= 0) {
      continue;
    }

    paydayPlans[index].bills.push({
      ...obligation,
      allocatedAmount:
        allocation / 100,
    });

    availableCents[index] -=
      allocation;

    remainingCents -=
      allocation;
  }

  /*
   * If a paycheck did not have enough
   * available cash, redistribute the
   * unfunded portion across remaining
   * eligible paycheck capacity.
   */
  if (remainingCents > 0) {
    for (
      let position =
        eligibleIndexes.length - 1;
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
          available,
          remainingCents
        );

      paydayPlans[index].bills.push({
        ...obligation,
        allocatedAmount:
          allocation / 100,
      });

      availableCents[index] -=
        allocation;

      remainingCents -=
        allocation;
    }
  }
}

/*
 * Fund an obligation from the latest
 * eligible paycheck first.
 *
 * This is the "Together" strategy.
 */
function allocateTogether(
  obligation: PaydayBill,
  eligibleIndexes: number[],
  paydayPlans: PaydayPlan[],
  availableCents: number[]
): void {
  if (
    eligibleIndexes.length === 0
  ) {
    return;
  }

  let remainingCents =
    Math.round(
      obligation.amount * 100
    );

  for (
    let position =
      eligibleIndexes.length - 1;
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

    paydayPlans[index].bills.push({
      ...obligation,
      allocatedAmount:
        allocation / 100,
    });

    availableCents[index] -=
      allocation;

    remainingCents -=
      allocation;
  }
}

function allocateObligations(
  obligations: PaydayBill[],
  paydayPlans: PaydayPlan[]
): PaydayPlan[] {
  if (
    paydayPlans.length === 0
  ) {
    return [];
  }

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
   * Process obligations in due-date
   * order so earlier obligations get
   * priority for paycheck capacity.
   */
  for (
    const obligation of obligations
  ) {
    const previousDueDate =
      getPreviousOccurrence(
        obligation,
        obligations
      );

    const eligibleIndexes =
      getEligiblePaydays(
        obligation,
        previousDueDate,
        paydayPlans
      );

    if (
      eligibleIndexes.length === 0
    ) {
      continue;
    }

    const split =
      shouldSplitObligation(
        obligation,
        eligibleIndexes,
        paydayPlans,
        settings
      );

/*Protected Amount Helper*/

    if (split) {
      allocateProportionally(
        obligation,
        eligibleIndexes,
        paydayPlans,
        availableCents
      );
    } else {
      allocateTogether(
        obligation,
        eligibleIndexes,
        paydayPlans,
        availableCents
      );
    }
  }

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
  bills: Bill[],
  debts: Debt[]
): PaydayPlan[] {
  const paydayPlans =
    buildCombinedPaydays(
      incomes
    );

  if (
    paydayPlans.length === 0
  ) {
    return [];
  }

  /*
   * Generate obligations across the
   * complete strategy window.
   */
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

  const obligations =
    getAllObligations(
      bills,
      debts,
      firstPayday,
      lastPayday
    );

  return allocateObligations(
    obligations,
    paydayPlans
  );
}