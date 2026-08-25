import { calculateDebtPayoff } from "../utils/debtPayoff";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/common/PageContainer";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import Card from "../components/common/Card";

import { useBills } from "../hooks/useBills";
import { useDebts } from "../hooks/useDebts";
import { useIncome } from "../hooks/useIncome";

import { calculateFinancialSummary } from "../utils/cashFlow";
import { formatCurrency } from "../utils/formatCurrency";

export default function ReportsPage() {
  const navigate = useNavigate();
  const { bills } = useBills();
  const { debts } = useDebts();
  const debtPlan = calculateDebtPayoff(debts, "avalanche", 250);
  const { income } = useIncome();
  const summary = calculateFinancialSummary(
    bills,
    debts,
    income
  );

  const totalDebt = debts.reduce(
    (sum, debt) => sum + debt.balance,
    0
  );

  const totalOriginalDebt = debts.reduce(
    (sum, debt) => sum + debt.originalBalance,
    0
  );

  const totalMinimumPayments = debts.reduce(
    (sum, debt) => sum + debt.minimumPayment,
    0
  );

  const debtPaidPercent =
    totalOriginalDebt > 0
      ? Math.round(
          ((totalOriginalDebt - totalDebt) /
            totalOriginalDebt) *
            100
        )
      : 0;

  const paidBills = bills.filter(
    (bill) => bill.paid
  ).length;

  const billProgress =
    bills.length > 0
      ? Math.round((paidBills / bills.length) * 100)
      : 0;

  const debtByType = useMemo(() => {
    const grouped: Record<string, number> = {};

    debts.forEach((debt) => {
      grouped[debt.type] =
        (grouped[debt.type] ?? 0) + debt.balance;
    });

    return Object.entries(grouped).sort(
      (a, b) => b[1] - a[1]
    );
  }, [debts]);

  return (
    <PageContainer>
      <PageHeader
        title="Reports"
        subtitle="Your complete financial picture"
      />

      {/* Cash Flow */}
      <Card>
        <h2 className="text-lg font-bold text-slate-900">
          Monthly Cash Flow
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <StatCard
            title="Income"
            value={formatCurrency(summary.totalIncome)}
            valueClassName="text-green-600"
          />

          <StatCard
            title="Bills"
            value={formatCurrency(summary.totalBills)}
            valueClassName="text-red-600"
          />

          <StatCard
            title="Debt Payments"
            value={formatCurrency(
              summary.totalDebtPayments
            )}
            valueClassName="text-orange-600"
          />

          <StatCard
            title="Remaining Cash"
            value={formatCurrency(
              summary.remainingCash
            )}
            valueClassName={
              summary.remainingCash >= 0
                ? "text-blue-600"
                : "text-red-600"
            }
          />
        </div>
      </Card>

      {/* Debt Overview */}
      <Card>
        <h2 className="text-lg font-bold text-slate-900">
          Debt Overview
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <StatCard
            title="Total Debt"
            value={formatCurrency(totalDebt)}
          />

          <StatCard
            title="Monthly Minimums"
            value={formatCurrency(
              totalMinimumPayments
            )}
          />

          <StatCard
            title="Original Debt"
            value={formatCurrency(
              totalOriginalDebt
            )}
          />

          <StatCard
            title="Debt Paid"
            value={`${debtPaidPercent}%`}
            valueClassName="text-green-600"
          />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Overall debt progress
            </span>

            <span className="font-semibold text-green-600">
              {debtPaidPercent}%
            </span>
          </div>

          <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(100, debtPaidPercent)
                )}%`,
              }}
            />
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {formatCurrency(
              Math.max(
                0,
                totalOriginalDebt - totalDebt
              )
            )}{" "}
            paid toward your original debt.
          </p>
        </div>
      </Card>
{/* Debt Payoff Plan */}
<button
  type="button"
  onClick={() => navigate("/debt-planner")}
      className="w-full text-left">
    <Card>
      <div className="flex items-start justify-between gap-4">

    <div>
      <h2 className="text-lg font-bold text-slate-900">
        Debt Payoff Plan
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Avalanche strategy with $250 extra per month.
      </p>
    </div>

    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
      Avalanche
    </span>
  </div>

  {debtPlan.totalStartingDebt === 0 ? (
    <p className="mt-5 text-sm text-slate-500">
      Add debts to see your projected payoff plan.
    </p>
  ) : (
    <div className="mt-5 grid grid-cols-2 gap-4">
      <StatCard
        title="Debt-Free Date"
        value={
          debtPlan.payoffDate
            ? new Date(
                `${debtPlan.payoffDate}T12:00:00`
              ).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })
            : "—"
        }
      />

      <StatCard
        title="Months"
        value={debtPlan.totalMonths}
      />

      <StatCard
        title="Projected Interest"
        value={formatCurrency(
          debtPlan.totalInterest
        )}
        valueClassName="text-orange-600"
      />

      <StatCard
        title="Extra Payment"
        value={formatCurrency(
          extraPayment
        )}
        valueClassName="text-blue-600"
      />
    </div>
  )}
</Card>
</button>


      {/* Bill Progress */}
      <Card>
        <h2 className="text-lg font-bold text-slate-900">
          Bill Progress
        </h2>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-slate-900">
              {paidBills}
            </p>

            <p className="text-sm text-slate-500">
              of {bills.length} bills paid
            </p>
          </div>

          <p className="text-2xl font-bold text-blue-600">
            {billProgress}%
          </p>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width: `${billProgress}%`,
            }}
          />
        </div>
      </Card>

      {/* Debt Breakdown */}
      <Card>
        <h2 className="text-lg font-bold text-slate-900">
          Debt Breakdown
        </h2>

        {debtByType.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No debts added yet.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {debtByType.map(
              ([type, amount]) => {
                const percentage =
                  totalDebt > 0
                    ? Math.round(
                        (amount / totalDebt) *
                          100
                      )
                    : 0;

                return (
                  <div key={type}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700">
                        {type}
                      </span>

                      <span className="font-semibold text-slate-900">
                        {formatCurrency(amount)}
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-orange-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {percentage}% of total debt
                    </p>
                  </div>
                );
              }
            )}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}