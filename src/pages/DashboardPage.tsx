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
import { calculateDebtPayoff } from "../utils/debtPayoff";

export default function DashboardPage() {
  const { bills, addBill } = useBills();
  const { debts } = useDebts();
  const { income } = useIncome();
  const debtPlan = calculateDebtPayoff(debts, "avalanche", 250);
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

      {/* Debt Payoff */}
<button
  type="button"
  onClick={() => {
    if (overdueBills > 0 || dueSoonBills > 0) {
      navigate("/bills");
    } else if (debts.length > 0) {
      navigate("/debts");
    } else {
      navigate("/calendar");
    }
  }}
  className="w-full text-left"
>
  <Card>
    <p className="text-sm font-semibold text-slate-500">
      What's Next
    </p>

    {overdueBills > 0 ? (
      <>
        <h2 className="mt-2 text-xl font-bold text-red-600">
          🔴 {overdueBills}{" "}
          {overdueBills === 1 ? "bill is" : "bills are"} overdue
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Tap to review your overdue bills.
        </p>
      </>
    ) : dueSoonBills > 0 ? (
      <>
        <h2 className="mt-2 text-xl font-bold text-orange-600">
          🟠 {dueSoonBills}{" "}
          {dueSoonBills === 1 ? "bill is" : "bills are"} due soon
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Tap to review your upcoming payments.
        </p>
      </>
    ) : debts.length > 0 ? (
      <>
        <h2 className="mt-2 text-xl font-bold text-blue-600">
          🎯 Stay focused on your debt
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Tap to review your debts.
        </p>
      </>
    ) : (
      <>
        <h2 className="mt-2 text-xl font-bold text-green-600">
          🟢 You're on track
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Tap to review your calendar.
        </p>
      </>
    )}
  </Card>
</button>

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