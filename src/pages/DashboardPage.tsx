import { useState } from "react";
import { Plus } from  "lucide-react"
import { formatCurrency } from "../utils/formatCurrency";
import PageContainer from "../components/common/PageContainer";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import Card from "../components/common/Card";
import UpcomingBills from "../components/dashboard/UpcomingBills";
import { useBills } from "../hooks/useBills";
import { useDebts } from "../hooks/useDebts";
import { useIncome } from "../hooks/useIncome";
import { calculateFinancialSummary } from "../utils/cashFlow";
import Button from "../components/common/Button";
import AddBillModal from "../components/bills/AddBillModal";

export default function DashboardPage() {
  const { bills, addBill } = useBills();
  const { debts } = useDebts();
  const { income } = useIncome();
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const summary = calculateFinancialSummary(
    bills,
    debts,
    income
  );

  const totalBills = bills.length;

  const paidBills = bills.filter(
    (bill) => bill.paid
  ).length;

  const overdueBills = bills.filter(
    (bill) =>
      !bill.paid &&
      new Date(bill.dueDate) < new Date()
  ).length;

const today = new Date();
today.setHours(0, 0, 0, 0);

const sevenDaysFromNow = new Date(today);
sevenDaysFromNow.setDate(today.getDate() + 7);

const dueSoonBills = bills.filter((bill) => {
  if (bill.paid) return false;

  const dueDate = new Date(bill.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate >= today && dueDate <= sevenDaysFromNow;
}).length;

  const progress =
    totalBills === 0
      ? 0
      : Math.round((paidBills / totalBills) * 100);

  return (
    <PageContainer>

      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! 👋"
      />
      {/* Quick Add */}
      <Button
        type="button"
        onClick={() => setIsAddBillOpen(true)}
        className="flex w-full items-center justify-center gap-2"
      >
        <Plus size={20} />
        Quick Add Bill
      </Button>

      <div className="grid grid-cols-2 gap-4">

        <StatCard
          title="Monthly Income"
          value={formatCurrency(summary.totalIncome)}
          valueClassName="text-green-600"
        />

        <StatCard
          title="Monthly Bills"
          value={formatCurrency(summary.totalBills)}
          valueClassName="text-red-600"
        />

        <StatCard
          title="Debt Payments"
          value={formatCurrency(summary.totalDebtPayments)}
          valueClassName="text-orange-600"
        />

        <StatCard
          title="Remaining Cash"
          value={formatCurrency(summary.remainingCash)}
          valueClassName="text-blue-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">

<Card>
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-semibold text-slate-500">
        Monthly Cash Flow
      </p>

      <p
        className={`mt-1 text-2xl font-bold ${
          summary.remainingCash >= 0
            ? "text-green-600"
            : "text-red-600"
        }`}
      >
        {formatCurrency(summary.remainingCash)}
      </p>
    </div>

    <div
      className={`rounded-full px-3 py-1 text-sm font-bold ${
        summary.remainingCash >= 0
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {summary.remainingCash >= 0
        ? "Positive"
        : "Negative"}
    </div>
  </div>

  <p className="mt-3 text-sm text-slate-500">
    {summary.remainingCash >= 0
      ? "You have money remaining after this month's planned obligations."
      : "Your planned obligations exceed your income this month."}
  </p>
</Card>

  <StatCard
    title="Bills Added"
    value={totalBills}
  />

  <StatCard
    title="Bills Paid"
    value={paidBills}
  />

  <StatCard
    title="Due Soon"
    value={dueSoonBills}
    valueClassName="text-orange-600"
  />

  <StatCard
    title="Overdue Bills"
    value={overdueBills}
    valueClassName="text-red-600"
  />

  <StatCard
    title="Progress"
    value={`${progress}%`}
    valueClassName="text-blue-600"
  />

      </div>

<Card>
  <div className="flex items-start justify-between gap-4">
    <div>
      <p className="text-sm font-semibold text-slate-500">
        Debt Payoff
      </p>

      <h2 className="mt-1 text-2xl font-bold text-slate-900">
        {formatCurrency(debtPlan.totalStartingDebt)}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Total debt remaining
      </p>
    </div>

    <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
      Avalanche
    </div>
  </div>

  <div className="mt-5 grid grid-cols-2 gap-3">
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500">
        Minimum Payments
      </p>

      <p className="mt-1 font-bold text-slate-900">
        {formatCurrency(summary.totalDebtPayments)}
      </p>

      <p className="text-xs text-slate-500">
        per month
      </p>
    </div>

    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500">
        Extra Payment
      </p>

      <p className="mt-1 font-bold text-blue-600">
        {formatCurrency(debtPlan.extraMonthlyPayment)}
      </p>

      <p className="text-xs text-slate-500">
        per month
      </p>
    </div>
  </div>

  <div className="mt-4 rounded-xl bg-green-50 p-4">
    <p className="text-xs font-semibold text-green-700">
      Estimated Debt-Free Date
    </p>

    <p className="mt-1 text-xl font-bold text-green-700">
      {debtPlan.payoffDate
        ? new Date(
            `${debtPlan.payoffDate}T12:00:00`
          ).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        : "Add a debt to get started"}
    </p>
  </div>
</Card>

      <AddBillModal
        open={isAddBillOpen}
        onClose={() => setIsAddBillOpen(false)}
        onSave={(bill) => {
          addBill(bill);
          setIsAddBillOpen(false);
        }}
      />
    </PageContainer>
  );
}