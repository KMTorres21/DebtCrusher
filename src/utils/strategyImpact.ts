
import type { Debt } from "../types/Debt";
import type { ExtraPaymentAllocation } from "./extraPaymentAllocation";

export interface StrategyImpact {
  debtsEliminated: number;
  paidOffDebtNames: string[];
  deferredInterestAvoided: string[];
}

export function calculateStrategyImpact(
  allocations: ExtraPaymentAllocation[],
  debts: Debt[]
): StrategyImpact {
  const paidOffDebts =
    allocations.filter(
      (a) => a.remainingBalance <= 0
    );

  return {
    debtsEliminated:
      paidOffDebts.length,

    paidOffDebtNames:
      paidOffDebts.map(
        (a) => a.name
      ),

    deferredInterestAvoided:
      debts
        .filter(
          (debt) =>
            debt.promoDeferredInterest &&
            paidOffDebts.some(
              (a) => a.debtId === debt.id
            )
        )
        .map(
          (debt) => debt.name
        ),
  };
}