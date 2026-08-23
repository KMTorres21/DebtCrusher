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

function calculateMonthlyInterest(
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

  function getTargetDebt() {
    const remaining = activeDebts.filter(
      (debt) => debt.balanceRemaining > 0.005
    );

    if (strategy === "avalanche") {
      return remaining.sort(
        (a, b) => b.interestRate - a.interestRate
      )[0];
    }

    return remaining.sort(
      (a, b) =>
        a.balanceRemaining - b.balanceRemaining
    )[0];
  }

  let months = 0;
  let totalInterest = 0;

  const now = new Date();

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

      const interest = calculateMonthlyInterest(
        debt.balanceRemaining,
        debt.interestRate
      );

      debt.balanceRemaining += interest;
      debt.totalInterest += interest;
      totalInterest += interest;
    });

    /*
     * 2. Pay all required minimum payments.
     *
     * Any unused portion of a minimum payment
     * becomes available for the target debt.
     */
    let availableExtra = Math.max(
      0,
      extraMonthlyPayment
    );

    activeDebts.forEach((debt) => {
      if (debt.balanceRemaining <= 0.005) {
        return;
      }

      const payment = Math.min(
        debt.minimumPayment,
        debt.balanceRemaining
      );

      debt.balanceRemaining -= payment;

      if (debt.balanceRemaining <= 0.005) {
        debt.balanceRemaining = 0;

        availableExtra +=
          debt.minimumPayment - payment;

        if (debt.payoffMonth === null) {
          debt.payoffMonth = months;
        }
      }
    });

    /*
     * 3. Apply the extra payment to the priority debt.
     */
    while (availableExtra > 0.005) {
      const target = getTargetDebt();

      if (!target) {
        break;
      }

      const payment = Math.min(
        availableExtra,
        target.balanceRemaining
      );

      target.balanceRemaining -= payment;
      availableExtra -= payment;

      if (target.balanceRemaining <= 0.005) {
        target.balanceRemaining = 0;

        if (target.payoffMonth === null) {
          target.payoffMonth = months;
        }
      }
    }

    /*
     * 4. From the next month forward, a paid-off
     * debt's minimum payment rolls into the snowball.
     *
     * This is handled automatically by adding the
     * minimum payment of already-paid debts below.
     */
    activeDebts.forEach((debt) => {
      if (
        debt.balanceRemaining <= 0.005 &&
        debt.payoffMonth !== null &&
        debt.payoffMonth < months
      ) {
        extraMonthlyPayment += debt.minimumPayment;
      }
    });
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