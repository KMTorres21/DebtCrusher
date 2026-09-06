import { Debt } from "../types/Debt";

export interface ExtraPaymentAllocation {
  debtId: string;
  name: string;
  balance: number;
  amountToApply: number;
  remainingBalance: number;
}

function getDebtBalance(debt: Debt): number {
  return debt.statementBalance ?? debt.balance ?? 0;
}

function getDaysUntilPromoEnds(
  debt: Debt
): number | null {
  if (!debt.promoEndDate) {
    return null;
  }

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const promoEnd = new Date(
    `${debt.promoEndDate}T12:00:00`
  );

  return Math.ceil(
    (promoEnd.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

function promoPriority(debt: Debt): number {
  if (
    !debt.promoEndDate ||
    !debt.promoDeferredInterest
  ) {
    return 0;
  }

  const daysRemaining =
    getDaysUntilPromoEnds(debt);

  if (
    daysRemaining === null ||
    daysRemaining < 0
  ) {
    return 0;
  }

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

function isProtectedPromoDebt(
  debt: Debt
): boolean {
  if (
    debt.promoInterestRate !== 0 ||
    !debt.promoEndDate
  ) {
    return false;
  }

  const daysRemaining =
    getDaysUntilPromoEnds(debt);

  return (
    daysRemaining !== null &&
    daysRemaining > 90
  );
}

export function calculateExtraPaymentAllocation(
  debts: Debt[],
  strategy: "avalanche" | "snowball",
  extraAmount: number
): ExtraPaymentAllocation[] {
  if (extraAmount <= 0) {
    return [];
  }

  const sortedDebts = debts
    .filter((debt) => getDebtBalance(debt) > 0)
    .slice();

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

    if (strategy === "avalanche") {
      const interestDifference =
        b.interestRate -
        a.interestRate;

      if (interestDifference !== 0) {
        return interestDifference;
      }

      return (
        getDebtBalance(a) -
        getDebtBalance(b)
      );
    }

    const balanceDifference =
      getDebtBalance(a) -
      getDebtBalance(b);

    if (balanceDifference !== 0) {
      return balanceDifference;
    }

    return (
      b.interestRate -
      a.interestRate
    );
  });

  let remainingExtra = extraAmount;

  const allocations: ExtraPaymentAllocation[] =
    [];

  for (const debt of sortedDebts) {
    if (remainingExtra <= 0) {
      break;
    }

    const balance =
      getDebtBalance(debt);

    const amountToApply = Math.min(
      balance,
      remainingExtra
    );

    allocations.push({
      debtId: debt.id,
      name: debt.name,
      balance,
      amountToApply,
      remainingBalance: Math.max(
        0,
        balance - amountToApply
      ),
    });

    remainingExtra -= amountToApply;
  }

  return allocations;
}