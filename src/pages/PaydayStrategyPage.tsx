import { useMemo } from "react";

import PageContainer from "../components/common/PageContainer";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import StatCard from "../components/common/StatCard";

import { useBills } from "../hooks/useBills";
import { useIncome } from "../hooks/useIncome";

import {
  buildAllPaydayPlans,
  PaydayPlan,
} from "../utils/paydayStrategy";

import { formatCurrency } from "../utils/formatCurrency";

function formatDisplayDate(dateString: string): string {
  const date = new Date(
    `${dateString}T12:00:00`
  );

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PaydayCard({
  plan,
}: {
  plan: PaydayPlan;
}) {
  const isPositive = plan.remaining >= 0;

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Payday
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {formatDisplayDate(plan.payday)}
          </h2>
        </div>

        <div className="text-right">
          <p className="text-sm text-slate-500">
            Paycheck
          </p>

          <p className="text-xl font-bold text-green-600">
            {formatCurrency(plan.amount)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Bills to Cover
        </h3>

        {plan.bills.length === 0 ? (
          <div className="mt-3 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">
              No bills due before the next paycheck.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {plan.bills.map((item, index) => (
              <div
                key={`${item.bill.id}-${item.dueDate}-${index}`}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    {item.bill.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    Due {formatDisplayDate(item.dueDate)}
                  </p>
                </div>

                <p className="ml-4 shrink-0 font-bold text-slate-900">
                  {formatCurrency(item.bill.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <StatCard
          title="Bills to Cover"
          value={formatCurrency(plan.totalBills)}
          valueClassName="text-red-600"
        />

        <StatCard
          title="Remaining"
          value={formatCurrency(plan.remaining)}
          valueClassName={
            isPositive
              ? "text-green-600"
              : "text-red-600"
          }
        />
      </div>

      {plan.nextPayday && (
        <p className="mt-4 text-center text-xs text-slate-400">
          Next paycheck:{" "}
          {formatDisplayDate(plan.nextPayday)}
        </p>
      )}
    </Card>
  );
}

export default function PaydayStrategyPage() {
  const { bills } = useBills();
  const { income } = useIncome();

  const paydayPlans = useMemo(
    () =>
      buildAllPaydayPlans(
        income,
        bills
      ),
    [income, bills]
  );

  const totalUpcomingBills = paydayPlans.reduce(
    (sum, plan) =>
      sum + plan.totalBills,
    0
  );

  const totalUpcomingIncome = paydayPlans.reduce(
    (sum, plan) =>
      sum + plan.amount,
    0
  );

  const projectedRemaining =
    totalUpcomingIncome -
    totalUpcomingBills;

  return (
    <PageContainer>
      <PageHeader
        title="Payday Strategy"
        subtitle="Plan which bills each paycheck should cover."
      />

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Upcoming Income"
          value={formatCurrency(
            totalUpcomingIncome
          )}
          valueClassName="text-green-600"
        />

        <StatCard
          title="Upcoming Bills"
          value={formatCurrency(
            totalUpcomingBills
          )}
          valueClassName="text-red-600"
        />
      </div>

      <Card>
        <p className="text-sm font-semibold text-slate-500">
          Projected Remaining
        </p>

        <p
          className={`mt-2 text-3xl font-bold ${
            projectedRemaining >= 0
              ? "text-blue-600"
              : "text-red-600"
          }`}
        >
          {formatCurrency(projectedRemaining)}
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Projected income remaining after the bills
          assigned to the upcoming paychecks.
        </p>
      </Card>

      {paydayPlans.length === 0 ? (
        <Card>
          <div className="py-6 text-center">
            <div className="text-5xl">💰</div>

<<<<<<< HEAD
export default function PaydayStrategyPage() {
 
=======
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              No upcoming paychecks
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add an income source with a valid payday
              to build your strategy.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          {paydayPlans.map((plan, index) => (
            <PaydayCard
              key={`${plan.income.id}-${plan.payday}-${index}`}
              plan={plan}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
>>>>>>> e11c86b1d043c812db38341a4646527bde6a2d3c
}