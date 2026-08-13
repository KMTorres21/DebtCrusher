import { CalendarDays, CheckCircle2, CircleAlert, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

import { useBills } from "../hooks/useBills";

export default function DashboardPage() {
  const { bills } = useBills();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthBills = bills.filter((bill) => {
    const dueDate = new Date(`${bill.dueDate}T00:00:00`);

    return (
      dueDate.getMonth() === currentMonth &&
      dueDate.getFullYear() === currentYear
    );
  });

  const totalBills = monthBills.reduce(
    (total, bill) => total + bill.amount,
    0
  );

  const unpaidBills = monthBills.filter((bill) => !bill.paid);

  const unpaidTotal = unpaidBills.reduce(
    (total, bill) => total + bill.amount,
    0
  );

  const paidBills = monthBills.filter((bill) => bill.paid);

  const overdueBills = unpaidBills.filter((bill) => {
    const dueDate = new Date(`${bill.dueDate}T00:00:00`);
    return dueDate < now;
  });

  const upcomingBills = unpaidBills
    .filter((bill) => {
      const dueDate = new Date(`${bill.dueDate}T00:00:00`);
      return dueDate >= now;
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  return (
    <div className="space-y-8 px-5 py-6 pb-32">

      {/* Welcome */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-lg text-slate-500">
          Welcome back! 👋
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Bills This Month */}
        <div className="rounded-2xl bg-white p-5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <CreditCard size={28} />
            </div>

            <span className="text-sm font-medium text-slate-400">
              This Month
            </span>
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Bills This Month
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-900">
            {formatCurrency(totalBills)}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {monthBills.length} bill{monthBills.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* Unpaid */}
        <div className="rounded-2xl bg-white p-5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
              <CalendarDays size={28} />
            </div>

            <span className="text-sm font-medium text-slate-400">
              Remaining
            </span>
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Unpaid Bills
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-900">
            {formatCurrency(unpaidTotal)}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {unpaidBills.length} remaining
          </p>
        </div>

        {/* Paid */}
        <div className="rounded-2xl bg-white p-5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
              <CheckCircle2 size={28} />
            </div>

            <span className="text-sm font-medium text-slate-400">
              Completed
            </span>
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Paid This Month
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-900">
            {paidBills.length}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            bill{paidBills.length === 1 ? "" : "s"} paid
          </p>
        </div>

        {/* Overdue */}
        <div className="rounded-2xl bg-white p-5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-red-100 p-3 text-red-600">
              <CircleAlert size={28} />
            </div>

            <span className="text-sm font-medium text-slate-400">
              Attention
            </span>
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Overdue Bills
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-900">
            {overdueBills.length}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {overdueBills.length === 0
              ? "You're all caught up"
              : "Needs attention"}
          </p>
        </div>
      </div>

      {/* Upcoming Bills */}
      <div className="rounded-2xl bg-white shadow-md">

        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Upcoming Bills
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              What's coming due next
            </p>
          </div>

          <Link
            to="/bills"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            View All
          </Link>
        </div>

        {upcomingBills.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={32} />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No upcoming bills
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              You're all caught up!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {upcomingBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-5"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {bill.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Due{" "}
                    {new Date(
                      `${bill.dueDate}T00:00:00`
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(bill.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <Link
            to="/bills"
            className="rounded-2xl bg-blue-600 p-5 text-white shadow-md transition hover:bg-blue-700"
          >
            <CreditCard size={32} />

            <p className="mt-4 text-lg font-bold">
              Manage Bills
            </p>

            <p className="mt-1 text-sm text-blue-100">
              Add, edit, and track your bills
            </p>
          </Link>

          <Link
            to="/income"
            className="rounded-2xl bg-slate-800 p-5 text-white shadow-md transition hover:bg-slate-900"
          >
            <CalendarDays size={32} />

            <p className="mt-4 text-lg font-bold">
              Manage Income
            </p>

            <p className="mt-1 text-sm text-slate-300">
              Track your income sources
            </p>
          </Link>

        </div>
      </div>

    </div>
  );
}