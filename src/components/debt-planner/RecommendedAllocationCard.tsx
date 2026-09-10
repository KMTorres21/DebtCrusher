import Card from "../common/Card";
import { formatCurrency } from "../../utils/formatCurrency";
import { ExtraPaymentAllocation } from "../../utils/extraPaymentAllocation";
import type { Debt } from "../../types/Debt";

interface RecommendedAllocationCardProps {
  allocations: ExtraPaymentAllocation[];
  extraAmount: number;
  debts: Debt[];
}

export default function RecommendedAllocationCard({
  allocations,
  extraAmount,
  debts,
}: RecommendedAllocationCardProps) {
  if (extraAmount <= 0) {
    return (
      <Card>
        <h2 className="text-lg font-bold">
          🎯 Recommended Extra Payment Allocation
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Enter an extra monthly payment to see where the
          additional money should be applied.
        </p>
      </Card>
    );
  }

    const totalAllocated = allocations.reduce(
    (sum, allocation) =>
      sum + allocation.amountToApply,
    0
  );

  const unusedExtra =
  extraAmount - totalAllocated;

  const paidOffDebts = allocations.filter(
    (allocation) =>
      allocation.remainingBalance <= 0
  );

  const debtsEliminated =
    paidOffDebts.length;

  const paidOffDebtNames =
    paidOffDebts.map(
      (allocation) => allocation.name
    );

  const deferredInterestAvoided =
  debts
    .filter(
      (debt) =>
        debt.promoDeferredInterest &&
        paidOffDebts.some(
          (allocation) =>
            allocation.debtId === debt.id
        )
    )
    .map(
      (debt) => debt.name
    );

  return (
    <Card>
      <h2 className="text-lg font-bold">
        🎯 Recommended Extra Payment Allocation
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Apply the extra payment in this order based on the
        selected payoff strategy.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-blue-50 p-3">
          <p className="text-xs text-slate-500">
            Extra Available
          </p>

          <p className="mt-1 font-bold text-blue-700">
            {formatCurrency(extraAmount)}
          </p>
        </div>

        <div className="rounded-xl bg-green-50 p-3">
          <p className="text-xs text-slate-500">
            Debts Eliminated
          </p>

          <p className="mt-1 font-bold text-green-700">
            {debtsEliminated}
          </p>
        </div>
      </div>

      {allocations.length === 0 ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            No eligible debts were found.
          </p>
        </div>
 ) : (
<>
  <div className="mt-4 space-y-3">
    {allocations.map((allocation, index) => (
      <div
        key={allocation.debtId}
        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            {index + 1}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-slate-900">
                {allocation.name}
              </p>

              {allocation.remainingBalance === 0 && (
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                  Paid Off
                </span>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500">
                  Current Balance
                </p>

                <p className="font-semibold">
                  {formatCurrency(
                    allocation.balance
                  )}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Apply Extra
                </p>

                <p className="font-bold text-green-600">
                  {formatCurrency(
                    allocation.amountToApply
                  )}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Balance After
                </p>

                <p className="font-semibold">
                  {formatCurrency(
                    allocation.remainingBalance
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>

  <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
  <h3 className="font-bold text-slate-900">
    🎯 Strategy Impact
  </h3>

  <div className="mt-4 space-y-3">
    <div>
      <p className="text-sm text-slate-500">
        Debts Eliminated
      </p>

      <p className="text-xl font-bold text-green-600">
        {debtsEliminated}
      </p>
    </div>

    {paidOffDebtNames.length > 0 && (
      <div>
        <p className="text-sm font-semibold text-slate-700">
          🏆 Accounts Paid Off
        </p>

        <ul className="mt-2 space-y-1">
          {paidOffDebtNames.map((name: string) => (
            <li
              key={name}
              className="text-sm text-slate-700"
            >
              ✅ {name}
            </li>
          ))}
        </ul>
      </div>
    )}

          {deferredInterestAvoided.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-amber-700">
            ⚠ Deferred Interest Risk Avoided
          </p>

          <ul className="mt-2 space-y-1">
            {deferredInterestAvoided.map((name: string) => (
              <li
                key={name}
                className="text-sm text-amber-700"
              >
                ✅ {name}
              </li>
            ))}
          </ul>
        </div>
      )}
  </div>
</div>

{unusedExtra > 0 && (
  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
    <p className="font-semibold text-green-800">
      All listed debts can be paid off.
    </p>

    <p className="mt-1 text-sm text-green-700">
      Unallocated amount:{" "}
      {formatCurrency(unusedExtra)}
    </p>
          </div>
          )}  
        </>
      )}
    </Card>
  );
}