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

    const allocations: ExtraPaymentAllocation[] = [];

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

  if (debts.length === 0) {
    return (
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
              Add your debts first to build a payoff plan.
            </p>
          </div>
        </Card>
      </PageContainer>
    );
  }
    return (
      <PageContainer>

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