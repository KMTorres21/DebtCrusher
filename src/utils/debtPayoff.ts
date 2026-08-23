import { Debt } from "../types/Debt";

export type PayoffStrategy = "avalanche" | "snowball";

export interface PayoffDebtResult {
  debtId: string;
  name: string;
  startingBalance: number;
  totalInterest: number;
  monthsToPayoff: number;
  payoffMonth: number;
  payoffYear: number;
}

export interface PayoffPlan {
  strategy: PayoffStrategy;
  extraMonthlyPayment: number;
  totalStartingDebt: number;
  totalInterest: number;
  totalMonths: number;
  payoffDate: string;
  debts: PayoffDebtResult[];
}

function monthlyInterest(
  balance: number,
  annualRate: number
): number {
  return balance * (annualRate / 100 / 12);
}

export function calculateDebtPayoff(
  debts: Debt[],
  strategy: PayoffStrategy,
  extraMonthlyPayment: number
): PayoffPlan {
  const activeDebts = debts
    .filter((debt) => debt.balance > 0)
    .map((debt) => ({
      ...debt,
      balanceRemaining: debt.balance,
      totalInterest: 0,
      payoffMonth: null as number | null,
    }));

  const totalStartingDebt = activeDebts.reduce(
    (sum, debt) => sum + debt.balance,
    0
  );

  if (activeDebts.length === 0) {
    return {
      strategy,
      extraMonthlyPayment,
      totalStartingDebt: 0,
      totalInterest: 0,
      totalMonths: 0,
      payoffDate: "",
      debts: [],
    };
  }

  const baseExtraPayment = Math.max(
    0,
    extraMonthlyPayment
  );

  let rolloverPayment = 0;
  let months = 0;
  let totalInterest = 0;

  const now = new Date();

  function getTargetDebt() {
    const remaining = activeDebts.filter(
      (debt) => debt.balanceRemaining > 0.005
    );

    if (remaining.length === 0) {
      return undefined;
    }

    if (strategy === "avalanche") {
      return [...remaining].sort(
        (a, b) => b.interestRate - a.interestRate
      )[0];
    }

    return [...remaining].sort(
      (a, b) =>
        a.balanceRemaining - b.balanceRemaining
    )[0];
  }

  while (
    activeDebts.some(
      (debt) => debt.balanceRemaining > 0.005
    ) &&
    months < 1200
  ) {
    months++;

    /*
     * 1. Apply monthly interest.
     */
    activeDebts.forEach((debt) => {
      if (debt.balanceRemaining <= 0.005) {
        return;
      }

      const interest = monthlyInterest(
        debt.balanceRemaining,
        debt.interestRate
      );

      debt.balanceRemaining += interest;
      debt.totalInterest += interest;
      totalInterest += interest;
    });

    /*
     * 2. Pay minimum payments.
     */
    let extraAvailable =
      baseExtraPayment + rolloverPayment;

    activeDebts.forEach((debt) => {
      if (debt.balanceRemaining <= 0.005) {
        return;
      }

      const payment = Math.min(
        debt.minimumPayment,
        debt.balanceRemaining
      );

      debt.balanceRemaining -= payment;

      /*
       * If the minimum payment was larger than
       * the remaining balance, the unused portion
       * becomes available immediately.
       */
      if (payment < debt.minimumPayment) {
        extraAvailable +=
          debt.minimumPayment - payment;
      }

      if (debt.balanceRemaining <= 0.005) {
        debt.balanceRemaining = 0;

        if (debt.payoffMonth === null) {
          debt.payoffMonth = months;
        }
      }
    });

    /*
     * 3. Apply extra money to the target debt.
     */
    while (extraAvailable > 0.005) {
      const target = getTargetDebt();

      if (!target) {
        break;
      }

      const payment = Math.min(
        extraAvailable,
        target.balanceRemaining
      );

      target.balanceRemaining -= payment;
      extraAvailable -= payment;

      if (target.balanceRemaining <= 0.005) {
        target.balanceRemaining = 0;

        if (target.payoffMonth === null) {
          target.payoffMonth = months;
        }
      }
    }

    /*
     * 4. Recalculate the rollover for the NEXT month.
     *
     * Once a debt is paid off, its minimum payment
     * becomes part of the snowball permanently.
     */
    rolloverPayment = activeDebts
      .filter(
        (debt) =>
          debt.balanceRemaining <= 0.005 &&
          debt.payoffMonth !== null
      )
      .reduce(
        (sum, debt) =>
          sum + debt.minimumPayment,
        0
      );
  }

  const payoffDate = new Date(
    now.getFullYear(),
    now.getMonth() + months,
    1
  );

  const results: PayoffDebtResult[] =
    activeDebts.map((debt) => {
      const payoffMonth =
        debt.payoffMonth ?? months;

      const debtPayoffDate = new Date(
        now.getFullYear(),
        now.getMonth() + payoffMonth,
        1
      );

      return {
        debtId: debt.id,
        name: debt.name,
        startingBalance: debt.balance,
        totalInterest: debt.totalInterest,
        monthsToPayoff: payoffMonth,
        payoffMonth:
          debtPayoffDate.getMonth() + 1,
        payoffYear:
          debtPayoffDate.getFullYear(),
      };
    });

  return {
    strategy,
    extraMonthlyPayment,
    totalStartingDebt,
    totalInterest,
    totalMonths: months,
    payoffDate: payoffDate
      .toISOString()
      .split("T")[0],
    debts: results,
  };
}