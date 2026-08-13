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

  return (
    <div className="space-y-6 px-5 py-6 pb-32">
      <div>
        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Welcome back! 👋
        </p>
      </div>

      <div className="grid gap-4">

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-slate-500">
            Monthly Bills
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            ${totalMonthlyBills.toFixed(2)}
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

      </div>
    </div>
  );
}