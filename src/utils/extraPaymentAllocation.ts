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

    function isProtectedPromoDebt(
    debt: Debt
    ): boolean {

    if (
        debt.promoInterestRate !== 0 ||
        !debt.promoEndDate
    ) {
        return false;
    }

    const today = new Date();

    const promoEnd = new Date(
        `${debt.promoEndDate}T12:00:00`
    );

    const daysRemaining = Math.ceil(
        (
        promoEnd.getTime() -
        today.getTime()
        ) /
        (1000 * 60 * 60 * 24)
    );

    return daysRemaining > 90;
}
    function isProtectedPromoDebt(
    debt: Debt
    ): boolean {

    if (
        debt.promoInterestRate !== 0 ||
        !debt.promoEndDate
    ) {
        return false;
    }

    const today = new Date();

    const promoEnd = new Date(
        `${debt.promoEndDate}T12:00:00`
    );

    const daysRemaining = Math.ceil(
        (promoEnd.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return daysRemaining > 90;
    }

    function promoPriority(debt: Debt): number {

    if (
        !debt.promoEndDate ||
        !debt.promoDeferredInterest
    ) {
        return 0;
    }

    const today = new Date();

    const promoEnd = new Date(
        `${debt.promoEndDate}T12:00:00`
    );

    const daysRemaining = Math.ceil(
        (
        promoEnd.getTime() -
        today.getTime()
        ) /
        (1000 * 60 * 60 * 24)
    );

    if (daysRemaining <= 30) {
        return 3;
    }

    if (daysRemaining <= 60) {
        return 2;
    }

    if (daysRemaining <= 90) {
        return 1;
    }

    return 0;
    }

  if (strategy === "avalanche") {
    sortedDebts.sort((a, b) => {

    const promoDifference =
        promoPriority(b) -
        promoPriority(a);

    if (promoDifference !== 0) {
    return promoDifference;
    }

    const aProtected =
    isProtectedPromoDebt(a);

    const bProtected =
    isProtectedPromoDebt(b);

    if (aProtected !== bProtected) {
    return aProtected ? 1 : -1;
    }

    return (
    b.interestRate -
    a.interestRate
    );
    });
  } else {
    sortedDebts.sort((a, b) => {

    const promoDifference =
        promoPriority(b) -
        promoPriority(a);

    if (promoDifference !== 0) {
    return promoDifference;
    }

    const aProtected =
    isProtectedPromoDebt(a);

    const bProtected =
    isProtectedPromoDebt(b);

    if (aProtected !== bProtected) {
    return aProtected ? 1 : -1;
    }

    return (
    (a.statementBalance ?? a.balance) -
    (b.statementBalance ?? b.balance)
    );
    });
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