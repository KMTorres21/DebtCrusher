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

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Monthly Progress
          </p>

          <span className="text-sm font-semibold text-blue-600">
            {progress}%
          </span>
        </div>

        <div className="mt-4">
          <UpcomingBills bills={bills} />
        </div>

        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-slate-600">
          {paidBills} of {totalBills} bills paid
        </p>

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