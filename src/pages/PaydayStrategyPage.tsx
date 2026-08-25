import { useMemo } from "react";
import PageContainer from "../components/common/PageContainer";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import StatCard from "../components/common/StatCard";

import { useBills } from "../hooks/useBills";
import { useIncome } from "../hooks/useIncome";
import { formatCurrency } from "../utils/formatCurrency";

export default function PaydayStrategyPage() {
  const { bills } = useBills();
  const { income } = useIncome();

  const monthlyIncome = useMemo(() => {
    return income.reduce((total, item) => {
      switch (item.frequency) {
        case "weekly":
          return total + item.amount * 52 / 12;

        case "biweekly":
          return total + item.amount * 26 / 12;

        case "semimonthly":
          return total + item.amount * 2;

        case "monthly":
          return total + item.amount;

        default:
          return total;
      }
    }, 0);
  }, [income]);

  const monthlyBills = useMemo(() => {
    return bills.reduce(
      (total, bill) => total + bill.amount,
      0
    );
  }, [bills]);

  const remainingAfterBills =
    monthlyIncome - monthlyBills;

  return (
    <PageContainer>
      <PageHeader
        title="Payday Strategy"
        subtitle="Plan which bills get paid from each paycheck."
      />

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Monthly Income"
          value={formatCurrency(monthlyIncome)}
          valueClassName="text-green-600"
        />

        <StatCard
          title="Monthly Bills"
          value={formatCurrency(monthlyBills)}
          valueClassName="text-red-600"
        />
      </div>

      <Card>
        <h2 className="text-lg font-bold text-slate-900">
          Available After Bills
        </h2>

        <p
          className={`mt-2 text-3xl font-bold ${
            remainingAfterBills >= 0
              ? "text-blue-600"
              : "text-red-600"
          }`}
        >
          {formatCurrency(remainingAfterBills)}
        </p>

        <p className="mt-2 text-sm text-slate-500">
          This is the amount remaining after the
          currently listed bills.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-slate-900">
          Bill Payment Schedule
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Your paycheck-to-bill assignments will appear
          here.
        </p>

        {bills.length === 0 ? (
          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-center">
            <p className="font-semibold text-slate-700">
              No bills added yet.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Add bills to build your payday strategy.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {bills
              .slice()
              .sort((a, b) =>
                a.dueDate.localeCompare(b.dueDate)
              )
              .map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {bill.name}
                    </p>

                    <p className="text-sm text-slate-500">
                      Due {bill.dueDate}
                    </p>
                  </div>

                  <p className="font-bold text-slate-900">
                    {formatCurrency(bill.amount)}
                  </p>
                </div>
              ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}