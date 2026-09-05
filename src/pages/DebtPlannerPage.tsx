import { 
    useMemo,
    useState 
    } from "react";
import { useDebts } from "../hooks/useDebts";
import {
    calculateDebtPayoff,
    PayoffStrategy,
    } from "../utils/debtPayoff";
import { formatCurrency } from "../utils/formatCurrency";
import { useBills } from "../hooks/useBills";
import { useIncome } from "../hooks/useIncome";
import { calculateFinancialSummary } from "../utils/cashFlow";
import PageContainer from "../components/common/PageContainer";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import StatCard from "../components/common/StatCard";

export default function DebtPlannerPage() {
  const { debts } = useDebts();
  const { bills } = useBills();
  const { income } = useIncome();

  const [strategy, setStrategy] =
    useState<PayoffStrategy>("avalanche");

  const [extraPayment, setExtraPayment] =
    useState("0");

  const extraAmount = Math.max(0, Number(extraPayment) || 0);
  const summary = calculateFinancialSummary(bills, debts, income);
  const availableAfterObligations = summary.remainingCash;
  const maxExtraPayment = Math.max(0,
    Math.round(availableAfterObligations * 100) / 100);
    
  const plan = useMemo(
    () =>
      calculateDebtPayoff(
        debts,
        strategy,
        extraAmount
      ),
    [debts, strategy, extraAmount]
  );

  const minimumPayments = debts.reduce(
    (sum, debt) =>
      sum + debt.minimumPayment,
    0
  );

  const totalMonthlyPayment =
    minimumPayments + extraAmount;

  const avalanchePlan = useMemo(
    () =>
      calculateDebtPayoff(
        debts,
        "avalanche",
        extraAmount
      ),
    [debts, extraAmount]
  );

  const snowballPlan = useMemo(
    () =>
      calculateDebtPayoff(
        debts,
        "snowball",
        extraAmount
      ),
    [debts, extraAmount]
  );

  const extraPaymentAllocations =
  useMemo<ExtraPaymentAllocation[]>(() => {
    if (debts.length === 0 || extraAmount <= 0) {
      return [];
    }

    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const preparedDebts = debts
      .map((debt) => {
        const balance =
          debt.statementBalance ??
          debt.balance ??
          0;

        const promoEnd = debt.promoEndDate
          ? new Date(
              `${debt.promoEndDate}T12:00:00`
            )
          : null;

        const promoActive =
          Boolean(promoEnd) &&
          promoEnd!.getTime() >= today.getTime();

        const monthsUntilPromoEnds =
          promoActive && promoEnd
            ? Math.max(
                1,
                Math.ceil(
                  (
                    promoEnd.getTime() -
                    today.getTime()
                  ) /
                    (
                      1000 *
                      60 *
                      60 *
                      24 *
                      30.4375
                    )
                )
              )
            : undefined;

        const effectiveInterestRate =
          promoActive
            ? debt.promoInterestRate ?? 0
            : debt.interestRate;

        const projectedMinimumPayments =
          monthsUntilPromoEnds !== undefined
            ? debt.minimumPayment *
              monthsUntilPromoEnds
            : 0;

        const cannotFinishBeforePromoEnds =
          promoActive &&
          monthsUntilPromoEnds !== undefined &&
          projectedMinimumPayments < balance;

        const promoExpiringSoon =
          promoActive &&
          monthsUntilPromoEnds !== undefined &&
          monthsUntilPromoEnds <= 3;

        const promoUrgent =
          promoActive &&
          Boolean(debt.promoDeferredInterest) &&
          (
            cannotFinishBeforePromoEnds ||
            promoExpiringSoon
          );

        return {
          debt,
          balance,
          promoActive,
          promoUrgent,
          monthsUntilPromoEnds,
          effectiveInterestRate,
        };
      })
      .filter((item) => item.balance > 0);

    const sortedDebts = [...preparedDebts].sort(
      (a, b) => {
        /*
         * Deferred-interest promotions that are in danger
         * of expiring receive first priority.
         */
        if (a.promoUrgent !== b.promoUrgent) {
          return a.promoUrgent ? -1 : 1;
        }

        /*
         * Active, non-urgent promotional balances are deferred
         * behind debts that are currently accruing interest.
         */
        if (
          a.promoActive !== b.promoActive &&
          !a.promoUrgent &&
          !b.promoUrgent
        ) {
          return a.promoActive ? 1 : -1;
        }

        if (strategy === "avalanche") {
          const rateDifference =
            b.effectiveInterestRate -
            a.effectiveInterestRate;

          if (rateDifference !== 0) {
            return rateDifference;
          }

          return a.balance - b.balance;
        }

        const balanceDifference =
          a.balance - b.balance;

        if (balanceDifference !== 0) {
          return balanceDifference;
        }

        return (
          b.effectiveInterestRate -
          a.effectiveInterestRate
        );
      }
    );

    let remainingExtra = extraAmount;

    for (const item of sortedDebts) {
      if (remainingExtra <= 0) {
        break;
      }

      const amount = Math.min(
        item.balance,
        remainingExtra
      );

      const remainingBalance = Math.max(
        0,
        item.balance - amount
      );

      let reason: string;

      if (item.promoUrgent) {
        reason = item.monthsUntilPromoEnds === 1
          ? "Deferred-interest promotion expires in about 1 month."
          : `Deferred-interest promotion expires in about ${item.monthsUntilPromoEnds} months.`;
      } else if (item.promoActive) {
        reason = item.monthsUntilPromoEnds === 1
          ? "Promotional rate is active for about 1 more month."
          : `Promotional rate is active for about ${item.monthsUntilPromoEnds} more months.`;
      } else if (strategy === "avalanche") {
        reason =
          "Prioritized because of its current interest rate.";
      } else {
        reason =
          "Prioritized because of its current balance.";
      }

      allocations.push({
        debtId: item.debt.id,
        name: item.debt.name,
        balance: item.balance,
        amount,
        remainingBalance,
        interestRate: item.debt.interestRate,
        effectiveInterestRate:
          item.effectiveInterestRate,
        promoEndDate: item.debt.promoEndDate,
        promoDeferredInterest:
          item.debt.promoDeferredInterest,
        promoActive: item.promoActive,
        promoUrgent: item.promoUrgent,
        monthsUntilPromoEnds:
          item.monthsUntilPromoEnds,
        reason,
      });

      remainingExtra -= amount;
    }

    return allocations;
  }, [debts, strategy, extraAmount]);

    const allocatedExtraPayment =
    extraPaymentAllocations.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const debtsEliminated =
      extraPaymentAllocations.filter(
        (item) => item.remainingBalance === 0
      ).length;

    const unusedExtraPayment = Math.max(
      0,
      extraAmount - allocatedExtraPayment
    );

  const interestSaved =
    snowballPlan.totalInterest -
    avalanchePlan.totalInterest;

  const monthsSaved =
    snowballPlan.totalMonths - 
    avalanchePlan.totalMonths;

  interface ExtraPaymentAllocation {
    debtId: string;
    name: string;
    balance: number;
    amount: number;
    remainingBalance: number;
    interestRate: number;
    effectiveInterestRate: number;
    promoEndDate?: string;
    promoDeferredInterest?: boolean;
    promoActive: boolean;
    promoUrgent: boolean;
    monthsUntilPromoEnds?: number;
    reason: string;
  }

    if (strategy === "avalanche") {
      return [...debts].sort(
        (a, b) => b.interestRate - a.interestRate
      )[0];
    }

    return [...debts].sort(
      (a, b) =>
        (a.statementBalance ?? a.balance) -
        (b.statementBalance ?? b.balance)
    )[0];

      <PageContainer>
        <PageHeader
          title="Debt Payoff Planner"
          subtitle="Build your path to debt-free."
        />

        <Card>
          <div className="text-center">
            <div className="text-5xl">🎯</div>

            <h2 className="mt-4 text-xl font-bold">
              No debts yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add your debts first to build a
              payoff plan.
            </p>
          </div>
        </Card>
      </PageContainer>
  }

  return (
    <PageContainer>
      <PageHeader
        title="Debt Payoff Planner"
        subtitle="Build your path to debt-free."
      />

      {/* Strategy */}
      <Card>
        <h2 className="text-lg font-bold">
          Payoff Strategy
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() =>
              setStrategy("avalanche")
            }
            className={`rounded-xl border-2 p-4 text-left transition ${
              strategy === "avalanche"
                ? "border-blue-600 bg-blue-50"
                : "border-slate-200"
            }`}
          >
            <div className="font-bold">
              Avalanche
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Highest interest rate first.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              setStrategy("snowball")
            }
            className={`rounded-xl border-2 p-4 text-left transition ${
              strategy === "snowball"
                ? "border-blue-600 bg-blue-50"
                : "border-slate-200"
            }`}
          >
            <div className="font-bold">
              Snowball
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Smallest balance first.
            </p>
          </button>
        </div>
      </Card>

      {/* Extra Payment */}
      <Card>
        <label
          htmlFor="extra-payment"
          className="block text-lg font-bold"
        >
          Extra Monthly Payment
        </label>

        <p className="mt-1 text-sm text-slate-500">
          Additional money applied to your
          payoff strategy each month.
        </p>

        <div className="relative">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
             $
            </span>

          <input
            id="extra-payment"
            type="number"
            min="0"
            step="25"
            value={extraPayment}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "") {
                setExtraPayment("");
                return;
              }

              const numericValue = Number(value);
              if (Number.isNaN(numericValue)) {
                return;
              }
              setExtraPayment(
                String(Math.max(0,numericValue))
              );
              }}
            className="w-full rounded-xl border border-slate-200 py-3 pl-8 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Available after obligations
            </span>
            {extraAmount > maxExtraPayment && (
              <p className="mt-2 text-sm font-semibold text-amber-600">
                This extra payment IS GREATER than your currently calculated available cash.
              </p>
            )}
            <span className="font-semibold text-green-600">
              {formatCurrency(maxExtraPayment)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setExtraPayment(String(maxExtraPayment))}
            className="mt-3 w-full rounded-xl bg-blue-50 px-4 py-3 text-blue-700 transition hover:bg-blue-100"
          >
            Use All Available Cash
          </button>
        </div>
      </Card>

        <Card>
          <h2 className="text-lg font-bold">
            🎯 Recommended Debt
          </h2>

          {recommendedDebt ? (
            <div className="mt-4 space-y-2">

              <p className="text-xl font-semibold">
                {recommendedDebt.name}
              </p>

              <p className="text-slate-600">
                Balance:
                {" "}
                {formatCurrency(
                  recommendedDebt.statementBalance ??
                  recommendedDebt.balance
                )}
              </p>

              <p className="text-slate-600">
                APR:
                {" "}
                {recommendedDebt.interestRate.toFixed(2)}%
              </p>

              <p className="font-medium text-green-600">
                Apply your extra
                {" "}
                {formatCurrency(extraAmount)}
                {" "}
                here.
              </p>

              <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
                {strategy === "avalanche"
                  ? "Highest interest rate in your portfolio. Paying this debt first minimizes total interest."
                  : "Smallest balance in your portfolio. Paying this debt first builds momentum with quick wins."}
              </div>

            </div>
          ) : (
            <p>No debt recommendation available.</p>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-bold">
            🎯 Recommended Extra Payment Allocation
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Recommendations use your selected payoff strategy and
            active promotional financing.
          </p>

          {extraAmount <= 0 ? (
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                Enter an extra monthly payment to see a recommended
                allocation.
              </p>
            </div>
          ) : (
            <>
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

              <div className="mt-4 space-y-3">
                {extraPaymentAllocations.map(
                  (allocation, index) => (
                    <div
                      key={allocation.debtId}
                      className={
                        allocation.promoUrgent
                          ? "rounded-xl border border-amber-300 bg-amber-50 p-4"
                          : "rounded-xl border border-slate-200 bg-slate-50 p-4"
                      }
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

                            {allocation.promoUrgent && (
                              <span className="rounded-full bg-amber-200 px-2 py-1 text-xs font-semibold text-amber-900">
                                Promo Expiring
                              </span>
                            )}

                            {allocation.promoActive &&
                              !allocation.promoUrgent && (
                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                                  Promo Protected
                                </span>
                              )}

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
                                  allocation.amount
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-slate-500">
                                Current APR
                              </p>

                              <p className="font-semibold">
                                {allocation.effectiveInterestRate.toFixed(
                                  2
                                )}
                                %
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

                          {allocation.promoActive &&
                            allocation.promoEndDate && (
                              <p className="mt-3 text-sm font-medium text-blue-700">
                                Promotional rate ends{" "}
                                {new Date(
                                  `${allocation.promoEndDate}T12:00:00`
                                ).toLocaleDateString("en-US")}
                              </p>
                            )}

                          <p className="mt-2 text-xs text-slate-600">
                            {allocation.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              {unusedExtraPayment > 0 && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="font-semibold text-green-800">
                    All listed debts can be paid off.
                  </p>

                  <p className="mt-1 text-sm text-green-700">
                    Unallocated amount:{" "}
                    {formatCurrency(unusedExtraPayment)}
                  </p>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Total Debt"
          value={formatCurrency(
            plan.totalStartingDebt
          )}
        />

        <StatCard
          title="Monthly Payment"
          value={formatCurrency(
            totalMonthlyPayment
          )}
        />

        <StatCard
          title="Available After Obligations"
          value={formatCurrency(availableAfterObligations)}
          valueClassName={
              availableAfterObligations >= 0 
              ? "text-green-600"
              : "text-red-600"
          }
        />

        <StatCard
          title="Total Interest"
          value={formatCurrency(
            plan.totalInterest
          )}
        />

        <StatCard
          title="Months to Payoff"
          value={plan.totalMonths}
        />
      </div>

      {/* Payoff Date */}
      <Card>
        <p className="text-sm text-slate-500">
          Debt-Free Date
        </p>

        <p className="mt-1 text-2xl font-bold text-green-600">
          {plan.payoffDate
            ? new Date(
                `${plan.payoffDate}T12:00:00`
              ).toLocaleDateString(
                "en-US",
                {
                  month: "long",
                  year: "numeric",
                }
              )
            : "—"}
        </p>
      </Card>

      {/* Strategy Comparison */}
      <Card>
        <h2 className="text-lg font-bold">
          Strategy Comparison
        </h2>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">
              Avalanche Interest
            </span>

            <span className="font-bold">
              {formatCurrency(
                avalanchePlan.totalInterest
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600">
              Snowball Interest
            </span>

            <span className="font-bold">
              {formatCurrency(
                snowballPlan.totalInterest
              )}
            </span>
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                Avalanche Interest Savings
              </span>

              <span className="font-bold text-green-600">
                {formatCurrency(
                  Math.max(0, interestSaved)
                )}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Payoff Order */}
      <Card>
        <h2 className="text-lg font-bold">
          Payoff Order
        </h2>

        <div className="mt-4 space-y-3">
          {plan.debts
            .slice()
            .sort(
              (a, b) =>
                a.monthsToPayoff -
                b.monthsToPayoff
            )
            .map((debt, index) => (
              <div
                key={debt.debtId}
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {debt.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    Paid off in{" "}
                    {debt.monthsToPayoff} months
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold">
                    {formatCurrency(
                      debt.totalInterest
                    )}
                  </p>

                  <p className="text-xs text-slate-500">
                    interest
                  </p>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </PageContainer>
  );
}