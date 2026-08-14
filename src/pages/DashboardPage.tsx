import UpcomingBills from "../components/dashboard/UpcomingBills";

import { useBills } from "../hooks/useBills";

export default function DashboardPage() {
  const { bills } = useBills();

  const totalBills = bills.length;

  const totalMonthlyBills = bills.reduce(
    (total, bill) => total + bill.amount,
    0
  );

  const paidBills = bills.filter((bill) => bill.paid).length;

  const overdueBills = bills.filter(
    (bill) =>
      !bill.paid &&
      new Date(bill.dueDate) < new Date()
  ).length;

  const progress =
    totalBills === 0
      ? 0
      : Math.round((paidBills / totalBills) * 100);

  return (
    <div className="space-y-6 px-5 py-6 pb-32">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Welcome back! 👋
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4">

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-slate-500">
            Monthly Bills
          </p>

          <h2 className="mt-2 text-3xl font-bold">
         formatCurrency(totalMonthlyBills)}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-slate-500">
            Bills Added
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {totalBills}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-slate-500">
            Bills Paid
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {paidBills}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-slate-500">
            Overdue Bills
          </p>

          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {overdueBills}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Monthly Progress
            </p>

            <span className="text-sm font-semibold text-blue-600">
              {progress}%
            </span>
          </div>

<UpcomingBills bills={bills} />

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-3 text-sm text-slate-600">
            {paidBills} of {totalBills} bills paid
          </p>
        </div>

      </div>
    </div>
  );
}