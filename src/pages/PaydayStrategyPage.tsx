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

function formatDisplayDate(
  dateString: string
): string {
  const date = new Date(
    `${dateString}T12:00:00`
  );

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function parseDate(
  dateString: string
): Date {
  return new Date(
    `${dateString}T12:00:00`
  );
}

function PaydayCard({
  plan,
}: {
  plan: PaydayPlan;
}) {
  const isPositive =
    plan.remaining >= 0;

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Payday
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {formatDisplayDate(
              plan.payday
            )}
          </h2>
        </div>

        <div className="text-right">
          <p className="text-sm text-slate-500">
            Paycheck
          </p>

          <p className="text-xl font-bold text-green-600">
            {formatCurrency(
              plan.amount
            )}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Bills to Fund
        </h3>

        {plan.bills.length === 0 ? (
          <div className="mt-3 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">
              No bills need funding from this paycheck.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {plan.bills.map(
              (item, index) => {
                const isFullyFunded =
                  Math.abs(
                    item.allocatedAmount -
                      item.bill.amount
                  ) < 0.01;

                return (
                  <div
                    key={`${item.bill.id}-${item.dueDate}-${index}`}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {item.bill.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        Due{" "}
                        {formatDisplayDate(
                          item.dueDate
                        )}
                      </p>

                      <p
                        className={`mt-1 text-xs font-semibold ${
                          isFullyFunded
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                      >
                        {isFullyFunded
                          ? "Fully Funded"
                          : "Partially Funded"}
                      </p>
                    </div>

                    <div className="ml-4 shrink-0 text-right">
                      <p className="font-bold text-slate-900">
                        {formatCurrency(
                          item.allocatedAmount
                        )}
                      </p>

                      {!isFullyFunded && (
                        <p className="text-xs text-slate-400">
                          of{" "}
                          {formatCurrency(
                            item.bill.amount
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <StatCard
          title="Allocated"
          value={formatCurrency(
            plan.totalBills
          )}
          valueClassName="text-red-600"
        />

        <StatCard
          title="Remaining"
          value={formatCurrency(
            plan.remaining
          )}
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
          {formatDisplayDate(
            plan.nextPayday
          )}
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

  const summary = useMemo(() => {
    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const cutoff =
      new Date(today);

    cutoff.setDate(
      cutoff.getDate() + 30
    );

    const upcomingPlans =
      paydayPlans.filter(
        (plan) => {
          const payday =
            parseDate(
              plan.payday
            );

          return (
            payday >= today &&
            payday <= cutoff
          );
        }
      );

    const totalUpcomingIncome =
      upcomingPlans.reduce(
        (sum, plan) =>
          sum + plan.amount,
        0
      );

    /*
     * Count each bill occurrence
     * only once.
     */
    const upcomingBills =
      new Map<
        string,
        number
      >();

    for (const plan of paydayPlans) {
      for (const item of plan.bills) {
        const dueDate =
          parseDate(
            item.dueDate
          );

        if (
          dueDate >= today &&
          dueDate <= cutoff
        ) {
          const key =
            `${item.bill.id}-${item.dueDate}`;

          if (
            !upcomingBills.has(
              key
            )
          ) {
            upcomingBills.set(
              key,
              item.bill.amount
            );
          }
        }
      }
    }

    const totalUpcomingBills =
      Array.from(
        upcomingBills.values()
      ).reduce(
        (sum, amount) =>
          sum + amount,
        0
      );

    return {
      totalUpcomingIncome,
      totalUpcomingBills,
      projectedRemaining:
        totalUpcomingIncome -
        totalUpcomingBills,
    };
  }, [paydayPlans]);

  return (
    <PageContainer>
      <PageHeader
        title="Payday Strategy"
        subtitle="Plan which bills each paycheck should fund."
      />

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Upcoming Income"
          value={formatCurrency(
            summary.totalUpcomingIncome
          )}
          valueClassName="text-green-600"
        />

        <StatCard
          title="Upcoming Bills"
          value={formatCurrency(
            summary.totalUpcomingBills
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
            summary.projectedRemaining >=
            0
              ? "text-blue-600"
              : "text-red-600"
          }`}
        >
          {formatCurrency(
            summary.projectedRemaining
          )}
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Projected income remaining after
          bills due in the next 30 days.
        </p>
      </Card>

      {paydayPlans.length ===
      0 ? (
        <Card>
          <div className="py-6 text-center">
            <div className="text-5xl">
              💰
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              No upcoming paychecks
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add an income source with
              a valid payday to build
              your strategy.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          {paydayPlans.map(
            (plan, index) => (
              <PaydayCard
                key={`${plan.income.id}-${plan.payday}-${index}`}
                plan={plan}
              />
            )
          )}
        </div>
      )}
    </PageContainer>
  );
}