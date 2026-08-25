import { useEffect,
         useMemo, 
         useState } from "react";
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
    useEffect(() => {
      const currentAmount =
        Number(extraPayment) || 0;
      if (currentAmount > maxExtraPayment) {
        setExtraPayment(String(extraPayment));
      } 
    }, [maxExtraPayment, extraPayment]);
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
              Add your debts first to build a
              payoff plan.
            </p>
          </div>
        </Card>
      </PageContainer>
    );
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
            className={`rounded-xl border-2 p-4 text-left transition {
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

        <div className="relative mt-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            $
          </span>

          <input
            id="extra-payment"
            type="number"
            min="0"
            max={maxExtraPayment}
            step="25"
            value={extraPayment}
            onChange={(event) => {
              const value = event.target.value;

              if (value === "") {
                setExtraPayment("");
                return;
              }

              const numericValue = Number(value);
              setExtraPayment(
                String(Math.min(Math.max(0, numericValue), maxExtraPayment))
              );
              }}
            className="w-full rounded-xl border border-slate-200 py-3 pl-8 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Available after obligations
            </span>
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

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                Avalanche Advantage
              </span>

              <span className="font-bold text-green-600">
  {interestSaved > 0
    ? `${formatCurrency(interestSaved)} less interest`
    : interestSaved < 0
      ? `${formatCurrency(Math.abs(interestSaved))} more interest`
      : "Same interest"}
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