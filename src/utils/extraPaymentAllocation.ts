import { Debt } from "../types/Debt";

export interface ExtraPaymentAllocation {
  debtId: string;
  name: string;
  balance: number;
  amountToApply: number;
  remainingBalance: number;
}

export function calculateExtraPaymentAllocation(
  debts: Debt[],
  strategy: "avalanche" | "snowball",
  extraAmount: number
): ExtraPaymentAllocation[] {

  if (extraAmount <= 0) {
    return [];
  }

  const sortedDebts = [...debts];

  if (strategy === "avalanche") {
    sortedDebts.sort(
      (a, b) => b.interestRate - a.interestRate
    );
  } else {
    sortedDebts.sort(
      (a, b) =>
        (a.statementBalance ?? a.balance) -
        (b.statementBalance ?? b.balance)
    );
  }

  let remainingExtra = extraAmount;

  const allocations: ExtraPaymentAllocation[] = [];

  for (const debt of sortedDebts) {
    if (remainingExtra <= 0) {
      break;
    }

    const balance =
      debt.statementBalance ??
      debt.balance;

    const amountToApply = Math.min(
      balance,
      remainingExtra
    );

    allocations.push({
      debtId: debt.id,
      name: debt.name,
      balance,
      amountToApply,
      remainingBalance:
        balance - amountToApply,
    });

    remainingExtra -= amountToApply;
  }

  return allocations;
}