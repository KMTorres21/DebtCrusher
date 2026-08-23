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

  const orderedDebts = () => {
    return [...activeDebts].sort((a, b) => {
      if (strategy === "avalanche") {
        return b.interestRate - a.interestRate;
      }

      return a.balanceRemaining - b.balanceRemaining;
    });
  };

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
     * Apply monthly interest first.
     */
    activeDebts.forEach((debt) => {
      if (debt.balanceRemaining <= 0) {
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
     * Pay every debt's minimum payment.
     */
    let availableExtra = Math.max(
      0,
      extraMonthlyPayment
    );

    activeDebts.forEach((debt) => {
      if (debt.balanceRemaining <= 0) {
        return;
      }

      const minimumPayment = Math.min(
        debt.minimumPayment,
        debt.balanceRemaining
      );

      debt.balanceRemaining -= minimumPayment;
    });

    /*
     * Apply extra payment to the highest-priority
     * remaining debt.
     *
     * If a debt is paid off, its minimum payment
     * becomes available for the next target.
     */
    let rolloverPayment = 0;

    activeDebts.forEach((debt) => {
      if (debt.balanceRemaining <= 0.005) {
        debt.balanceRemaining = 0;
        rolloverPayment += debt.minimumPayment;
      }
    });

    availableExtra += rolloverPayment;

    while (availableExtra > 0.005) {
      const target = orderedDebts().find(
        (debt) => debt.balanceRemaining > 0.005
      );

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
      }
    }
  }

  const payoffDate = new Date(
    now.getFullYear(),
    now.getMonth() + months,
    1
  );

  const results: PayoffDebtResult[] =
    activeDebts.map((debt) => ({
      debtId: debt.id,
      name: debt.name,
      startingBalance: debt.balance,
      totalInterest: debt.totalInterest,
      monthsToPayoff: months,
      payoffMonth: payoffDate.getMonth() + 1,
      payoffYear: payoffDate.getFullYear(),
    }));

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