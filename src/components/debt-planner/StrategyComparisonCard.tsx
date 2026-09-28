import Card from "../common/Card";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  calculateExtraPaymentAllocation,
  ExtraPaymentAllocation,
} from "../../utils/extraPaymentAllocation";
import type { Debt } from "../../types/Debt";

type ComparisonStrategy =
  | "avalanche"
  | "snowball";

interface StrategyComparisonCardProps {
  debts: Debt[];
  extraAmount: number;
  selectedStrategy: ComparisonStrategy;
}

interface StrategyComparisonResult {
  strategy: ComparisonStrategy;
  allocations: ExtraPaymentAllocation[];
  debtsEliminated: number;
  totalDebtReduced: number;
  debtReductionPercentage: number;
  highestAPREliminated: Debt | null;
  deferredInterestRisksAvoided: number;
  score: number;
  strength: string;
}

function calculateComparisonResult(
  debts: Debt[],
  extraAmount: number,
  strategy: ComparisonStrategy
): StrategyComparisonResult {
  const allocations =
    calculateExtraPaymentAllocation(
      debts,
      strategy,
      extraAmount
    );

  const paidOffAllocations =
    allocations.filter(
      (allocation) =>
        allocation.remainingBalance <= 0
    );

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

  const totalDebtReduced =
    allocations.reduce(
      (sum, allocation) =>
        sum + allocation.amountToApply,
      0
    );

  const debtReductionPercentage =
    totalDebtBefore > 0
      ? Math.min(
          100,
          (
            totalDebtReduced /
            totalDebtBefore
          ) * 100
        )
      : 0;

  const eliminatedDebtRecords =
    debts.filter(
      (debt) =>
        paidOffAllocations.some(
          (allocation) =>
            allocation.debtId === debt.id
        )
    );

  const highestAPREliminated =
    eliminatedDebtRecords.reduce<Debt | null>(
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

  const deferredInterestRisksAvoided =
    eliminatedDebtRecords.filter(
      (debt) =>
        debt.promoDeferredInterest === true
    ).length;

  let score = 0;

  score += paidOffAllocations.length * 10;
  score += debtReductionPercentage;

  if (highestAPREliminated) {
    score += 20;
  }

  if (
    deferredInterestRisksAvoided > 0
  ) {
    score += 20;
  }

  const strength =
    score >= 100
      ? "Exceptional"
      : score >= 75
      ? "Excellent"
      : score >= 50
      ? "Strong"
      : score >= 25
      ? "Moderate"
      : "Limited";

  return {
    strategy,
    allocations,
    debtsEliminated:
      paidOffAllocations.length,
    totalDebtReduced,
    debtReductionPercentage,
    highestAPREliminated,
    deferredInterestRisksAvoided,
    score,
    strength,
  };
}

function getStrategyLabel(
  strategy: ComparisonStrategy
): string {
  return strategy === "avalanche"
    ? "Avalanche"
    : "Snowball";
}

function getStrategyDescription(
  strategy: ComparisonStrategy
): string {
  return strategy === "avalanche"
    ? "Prioritizes debts currently carrying the highest interest rates."
    : "Prioritizes the smallest balances to create faster account payoffs.";
}

export default function StrategyComparisonCard({
  debts,
  extraAmount,
  selectedStrategy,
}: StrategyComparisonCardProps) {
  if (
    debts.length === 0 ||
    extraAmount <= 0
  ) {
    return null;
  }

  const avalanche =
    calculateComparisonResult(
      debts,
      extraAmount,
      "avalanche"
    );

  const snowball =
    calculateComparisonResult(
      debts,
      extraAmount,
      "snowball"
    );

        const results = [
        avalanche,
        snowball,
        ];

        const highestScore = Math.max(
        ...results.map(
            (result) => result.score
        )
        );

        const winningStrategies =
        results.filter(
            (result) =>
            result.score === highestScore
        );

        const hasTie =
        winningStrategies.length > 1;

        const strongestStrategy =
        results.reduce(
            (best, current) =>
            current.score > best.score
                ? current
                : best
        );

        const weakestStrategy =
        results.reduce(
            (worst, current) =>
            current.score < worst.score
                ? current
                : worst
        );

        const scoreDifference =
        strongestStrategy.score -
        weakestStrategy.score;

        const debtReductionDifference =
        strongestStrategy.totalDebtReduced -
        weakestStrategy.totalDebtReduced;

        const debtEliminationDifference =
        strongestStrategy.debtsEliminated -
        weakestStrategy.debtsEliminated;

        const deferredInterestRiskDifference =
        strongestStrategy.deferredInterestRisksAvoided -
        weakestStrategy.deferredInterestRisksAvoided;

        return (
    <Card>
      <h2 className="text-lg font-bold">
        🏔 Strategy Comparison
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Compare the immediate impact of applying{" "}
        {formatCurrency(extraAmount)} using
        Avalanche or Snowball.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {results.map((result) => {
          const isSelected =
            result.strategy ===
            selectedStrategy;

          const isWinner =
            result.score ===
            highestScore;

          return (
            <div
              key={result.strategy}
              className={
                isWinner
                  ? "rounded-2xl border-2 border-green-500 bg-green-50 p-4"
                  : "rounded-2xl border border-slate-200 bg-slate-50 p-4"
              }
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-slate-900">
                  {getStrategyLabel(
                    result.strategy
                  )}
                </h3>

                {isSelected && (
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                    Selected
                  </span>
                )}

                {isWinner && !hasTie && (
                  <span className="rounded-full bg-green-200 px-2 py-1 text-xs font-semibold text-green-800">
                    Strongest Impact
                  </span>
                )}

                {isWinner && hasTie && (
                  <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">
                    Tied
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs text-slate-600">
                {getStrategyDescription(
                  result.strategy
                )}
              </p>

              <div className="mt-4 rounded-xl bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Recommendation Strength
                </p>

                <p className="mt-1 font-bold text-indigo-700">
                  🏅 {result.strength}
                </p>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-600">
                    Debts Eliminated
                  </span>

                  <span className="font-bold text-green-700">
                    {result.debtsEliminated}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-600">
                    Total Debt Reduced
                  </span>

                  <span className="font-bold text-green-700">
                    {formatCurrency(
                      result.totalDebtReduced
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-600">
                    Total Debt Reduction
                  </span>

                  <span className="font-bold text-green-700">
                    {result.debtReductionPercentage.toFixed(
                      1
                    )}
                    %
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <span className="text-slate-600">
                    Highest APR Eliminated
                  </span>

                  <span className="text-right font-semibold text-red-700">
                    {result.highestAPREliminated
                      ? `${result.highestAPREliminated.interestRate.toFixed(
                          2
                        )}%`
                      : "None"}
                  </span>
                </div>

                {result.highestAPREliminated && (
                  <p className="text-right text-xs text-slate-500">
                    {
                      result
                        .highestAPREliminated
                        .name
                    }
                  </p>
                )}

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-600">
                    Deferred-Interest Risks Avoided
                  </span>

                  <span className="font-bold text-amber-700">
                    {
                      result
                        .deferredInterestRisksAvoided
                    }
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="font-semibold text-blue-900">
            🏆 Why This Strategy Won
        </p>

        {!hasTie && (
        <div className="mt-3 rounded-lg border border-blue-300 bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-blue-600">
            Direct Comparison
            </p>

            <p className="mt-1 font-semibold text-blue-900">
            {getStrategyLabel(
                strongestStrategy.strategy
            )}
            {" "}
            outperformed{" "}
            {getStrategyLabel(
                weakestStrategy.strategy
            )}
            </p>

            <div className="mt-2 space-y-1 text-sm text-blue-800">
            <p>
                ✅ Impact score higher by{" "}
                {scoreDifference.toFixed(1)}
            </p>

            <p>
                ✅ Additional debt reduction:
                {" "}
                {formatCurrency(
                debtReductionDifference
                )}
            </p>

            <p>
                ✅ Additional debts eliminated:
                {" "}
                {debtEliminationDifference}
            </p>

            <p>
                ✅ Additional deferred-interest
                risks removed:
                {" "}
                {deferredInterestRiskDifference}
            </p>
            </div>
        </div>
        )}

        {!hasTie && (
            <div className="mt-3 space-y-2 text-sm text-blue-800">
            <p>
                ✅ Produced the strongest overall
                impact score (
                {winningStrategies[0].score.toFixed(
                1
                )}
                )
            </p>

            <p>
                ✅ Eliminated{" "}
                {
                winningStrategies[0]
                    .debtsEliminated
                }{" "}
                debt
                {winningStrategies[0]
                .debtsEliminated === 1
                ? ""
                : "s"}
            </p>

            <p>
                ✅ Reduced total debt by{" "}
                {formatCurrency(
                winningStrategies[0]
                    .totalDebtReduced
                )}
            </p>

            {winningStrategies[0]
                .highestAPREliminated && (
                <p>
                ✅ Eliminated the highest APR
                debt (
                {winningStrategies[0].highestAPREliminated.interestRate.toFixed(
                    2
                )}
                %)
                </p>
            )}

            {winningStrategies[0]
                .deferredInterestRisksAvoided >
                0 && (
                <p>
                ✅ Eliminated{" "}
                {
                    winningStrategies[0]
                    .deferredInterestRisksAvoided
                }{" "}
                deferred-interest risk
                {winningStrategies[0]
                    .deferredInterestRisksAvoided ===
                1
                    ? ""
                    : "s"}
                </p>
            )}
            </div>
        )}

        {hasTie && (
            <p className="mt-2 text-sm text-blue-800">
            Multiple strategies produced
            equally strong outcomes. Review
            the strengths of each strategy
            and choose the approach that
            best matches your goals.
            </p>
        )}
        </div>
    </Card>
  );
}