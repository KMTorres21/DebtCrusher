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

  const biggestWin =
  paidOffDebts.length > 0
    ? paidOffDebts.reduce(
        (largest, current) =>
          current.balance > largest.balance
            ? current
            : largest
      )
    : null;

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


    const remainingPromoRisks =
      debts
        .filter(
          (debt) =>
            debt.promoDeferredInterest &&
            allocations.some(
              (allocation) =>
                allocation.debtId === debt.id &&
                allocation.remainingBalance > 0
            )
        )
    .sort((a, b) => {
      const aDays =
        getDaysUntilPromoEnds(
          a.promoEndDate
        ) ?? Number.MAX_SAFE_INTEGER;

      const bDays =
        getDaysUntilPromoEnds(
          b.promoEndDate
        ) ?? Number.MAX_SAFE_INTEGER;

      return aDays - bDays;
    });


    function getDaysUntilPromoEnds(
      promoEndDate?: string
    ): number | null {
      if (!promoEndDate) {
        return null;
      }

      const today = new Date();
      today.setHours(12, 0, 0, 0);

      const endDate = new Date(
        `${promoEndDate}T12:00:00`
      );

      return Math.ceil(
        (endDate.getTime() -
          today.getTime()) /
          (1000 * 60 * 60 * 24)
      );
    }

      const highestAPREliminated =
      debts
        .filter(
          (debt) =>
            paidOffDebts.some(
              (allocation) =>
                allocation.debtId === debt.id
            )
        )
        .reduce<Debt | null>(
          (highest, debt) => {
            if (!highest) {
              return debt;
            }

            return debt.interestRate >
              highest.interestRate
              ? debt
              : highest;
          },
          null
        );

        const remainingDebts =
        allocations.filter(
          (allocation) =>
            allocation.remainingBalance > 0
        );

      const largestRemainingThreat =
        remainingDebts.length > 0
          ? remainingDebts.reduce(
              (largest, current) =>
                current.remainingBalance >
                largest.remainingBalance
                  ? current
                  : largest
            )
          : null;

      const totalDebtReduced =
      allocations.reduce(
        (sum, allocation) =>
          sum +
          (allocation.balance -
            allocation.remainingBalance),
        0
      );

      const recommendationReasons: string[] = [];
      if (debtsEliminated > 0) {
        recommendationReasons.push(
          `Eliminates ${debtsEliminated} debt${
            debtsEliminated === 1
              ? ""
              : "s"
          }`
        );
      }

      let recommendationScore = 0;

      recommendationScore +=
        debtsEliminated
    

        if (totalDebtReduced > 0) {
          recommendationReasons.push(
            `Reduces total debt by ${formatCurrency(
              totalDebtReduced
            )}`
          );
        }

        if (highestAPREliminated) {
          recommendationReasons.push(
            `Eliminates the highest APR debt (${highestAPREliminated.interestRate.toFixed(
              2
            )}%)`
          );
        }

        if (
          deferredInterestAvoided.length > 0
        ) {
          recommendationReasons.push(
            `Removes ${deferredInterestAvoided.length} deferred-interest risk${
              deferredInterestAvoided.length === 1
                ? ""
                : "s"
            }`
          );
        }

      const recommendationStrength =
        recommendationScore >= 100
          ? "Exceptional"
          : recommendationScore >= 75
          ? "Excellent"
          : recommendationScore >= 50
          ? "Strong"
          : recommendationScore >= 25
          ? "Moderate"
          : "Limited";
      
      const totalDebtBefore =
        debts.reduce(
          (sum, debt) =>
            sum +
            (
              debt.statementBalance ??
              debt.balance ??
              0
            ),
          0
        );

      const totalDebtAfter = Math.max(
        0,
        totalDebtBefore - totalDebtReduced
      );

      const totalDebtReductionPercentage =
        totalDebtBefore > 0
          ? Math.min(
              100,
              (
                totalDebtReduced /
                totalDebtBefore
              ) * 100
            )
          : 0;

      const totalDebtAccounts =
        debts.length;

      const complexityReductionPercentage =
        totalDebtAccounts > 0
          ? (
              (debtsEliminated /
                totalDebtAccounts) *
              100
            )
          : 0;

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

  <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
    <p className="font-semibold text-indigo-900">
      🎯 Why This Recommendation?
    </p>

    <div>
    <p className="text-sm font-semibold text-purple-700">
      🧹 Complexity Reduced
    </p>

    <p className="mt-1 font-semibold text-slate-900">
      {debtsEliminated} payment obligation
      {debtsEliminated === 1
        ? ""
        : "s"} removed
    </p>

    <p className="text-sm text-slate-600">
      {complexityReductionPercentage.toFixed(
        1
      )}
      % fewer debt accounts to manage
    </p>
    </div>

  <div className="mb-4 rounded-lg border border-indigo-300 bg-white p-3">
    <p className="text-xs uppercase tracking-wide text-indigo-600">
      Recommendation Strength
    </p>

    <p className="mt-1 text-lg font-bold text-indigo-900">
      🏅 {recommendationStrength}
    </p>
  </div>

    <ul className="mt-3 space-y-2">
      {recommendationReasons.map(
        (reason) => (
          <li
            key={reason}
            className="text-sm text-indigo-800"
          >
            ✅ {reason}
          </li>
        )
      )}
    </ul>
  </div>

  <div className="mt-4 space-y-3">
    <div>
      <p className="text-sm text-slate-500">
        Debts Eliminated
      </p>

      <p className="text-xl font-bold text-green-600">
        {debtsEliminated}
      </p>

  <div>
  <p className="text-sm font-semibold text-green-700">
    📉 Total Debt Impact
  </p>

  <div className="mt-3 grid grid-cols-2 gap-3">
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Before
      </p>

      <p className="mt-1 font-bold text-slate-900">
        {formatCurrency(totalDebtBefore)}
      </p>
    </div>

    <div className="rounded-xl border border-green-200 bg-green-50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-green-700">
        After
      </p>

      <p className="mt-1 font-bold text-green-700">
        {formatCurrency(totalDebtAfter)}
      </p>
    </div>
  </div>

  <div className="mt-3">
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600">
        Proposed reduction
      </span>

      <span className="font-semibold text-green-700">
        {formatCurrency(totalDebtReduced)}
      </span>
    </div>

    <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-green-600 transition-all duration-500"
        style={{
          width: `${totalDebtReductionPercentage}%`,
        }}
      />
    </div>

    <p className="mt-2 text-sm text-slate-600">
      {totalDebtReductionPercentage.toFixed(1)}% of total debt removed
    </p>
  </div>
</div>

          {biggestWin && (
      <div>
        <p className="text-sm font-semibold text-blue-700">
          🏆 Biggest Win
        </p>

        <p className="mt-1 font-semibold text-slate-900">
          {biggestWin.name}
        </p>

        <p className="text-sm text-slate-600">
          {formatCurrency(
            biggestWin.balance
          )} eliminated
        </p>
      </div>
    )}

        {highestAPREliminated && (
      <div>
        <p className="text-sm font-semibold text-red-700">
          🔥 Highest APR Eliminated
        </p>

        <p className="mt-1 font-semibold text-slate-900">
          {highestAPREliminated.name}
        </p>

        <p className="text-sm text-slate-600">
          {highestAPREliminated.interestRate.toFixed(
            2
          )}
          %
        </p>
      </div>
    )}

        {largestRemainingThreat && (
        <div>
          <p className="text-sm font-semibold text-orange-700">
            🚨 Largest Remaining Threat
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {largestRemainingThreat.name}
          </p>

          <p className="text-sm text-slate-600">
            Remaining Balance:{" "}
            {formatCurrency(
              largestRemainingThreat.remainingBalance
            )}
          </p>
        </div>
      )}
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


{remainingPromoRisks.length > 0 && (
  <div>
    <p className="text-sm font-semibold text-orange-700">
      ⚠ Remaining Promotional Risks
    </p>

    <div className="mt-2 space-y-2">
      {remainingPromoRisks.map(
        (debt) => {
          const daysRemaining =
            getDaysUntilPromoEnds(
              debt.promoEndDate
            );

          return (
            <div
              key={debt.id}
              className="rounded-lg border border-orange-200 bg-orange-50 p-3"
            >
              <p className="font-semibold text-orange-900">
                {debt.name}
              </p>

              {daysRemaining !== null && (
                <p className="text-sm text-orange-700">
                  {daysRemaining} days
                  remaining
                </p>
              )}

              <p className="text-sm text-orange-700">
                Remaining Balance:{" "}
                {formatCurrency(
                  debt.statementBalance ??
                    debt.balance
                      )}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

  </div>
</div>


{remainingPromoRisks.length > 0 && (
  <div>
    <p className="text-sm font-semibold text-red-700">
      ⏰ Next Promotional Deadline
    </p>

    <p className="mt-1 font-semibold text-slate-900">
      {remainingPromoRisks[0].name}
    </p>

    <p className="text-sm text-slate-600">
      {getDaysUntilPromoEnds(
        remainingPromoRisks[0]
          .promoEndDate
      )} days remaining
    </p>
  </div>
)}

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