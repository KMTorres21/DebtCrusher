import { calculateDebtPayoff } from "../utils/debtPayoff";
import { useMemo } from "react";
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
  const { bills } = useBills();
  const { debts } = useDebts();
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