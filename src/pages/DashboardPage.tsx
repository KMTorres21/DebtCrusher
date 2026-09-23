import { useState } from "react";
import { Plus } from "lucide-react";
import FinancialTimeline from "../components/dashboard/FinancialTimeline";
import { Bill } from "../types/Bill";
import { formatCurrency } from "../utils/formatCurrency";

import PageContainer from "../components/common/PageContainer";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

import UpcomingBills from "../components/dashboard/UpcomingBills";
import AddBillModal from "../components/bills/AddBillModal";

import { useBills } from "../hooks/useBills";
import { useDebts } from "../hooks/useDebts";
import { useIncome } from "../hooks/useIncome";

import { calculateFinancialSummary } from "../utils/cashFlow";

export default function DashboardPage() {
  const { bills, addBill, updateBill } = useBills();
  const { debts, updateDebt } = useDebts();
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

  const progress =
    totalBills === 0
      ? 0
      : Math.round((paidBills / totalBills) * 100);

  const today = new Date();

function getDaysUntilStatement(
  statementDate: string
    ): number {
      const statement =
        new Date(
          `${statementDate}T12:00:00`
        );

      if (
        Number.isNaN(
          statement.getTime()
        )
      ) {
        return 999;
      }

      const diffMs =
        statement.getTime() -
        Date.now();

      return Math.ceil(
        diffMs /
          (1000 * 60 * 60 * 24)
      );
    }

  const statementItems = [
    ...bills
      .filter(
        (bill) =>
          bill.statementDate &&
          !bill.statementReviewed
          
      )
      .map((bill) => ({
        name: bill.name,
        type: "Bill",
        statementDate:
          bill.statementDate!,
        reviewed: bill.statementReviewed ?? false,
        autoPayEnabled:
          bill.autoPayEnabled ??
  false,
      })),

    ...debts
      .filter(
        (debt) =>
          debt.statementDate &&
          !debt.statementReviewed
      )
      .map((debt) => ({
        name: debt.name,
        type: "Debt",
        statementDate:
          debt.statementDate!,
        reviewed: debt.statementReviewed ?? false,
        autoPayEnabled:
          debt.autoPayEnabled ??
          false,
      })),
  ]
    .map((item) => ({
      ...item,
      daysUntil:
        getDaysUntilStatement(
          item.statementDate
        ),
    }))
    
    .sort(
      (a, b) =>
        a.daysUntil -
        b.daysUntil
    );
      
  function handleAddBill(bill: Bill) {
    addBill(bill);
    setIsAddBillOpen(false);
  }

  const reviewedCount =
  statementItems.filter(
  (item) =>
  item.reviewed
  ).length;

  const needsReviewCount =
  statementItems.filter(
  (item) =>
  !item.reviewed
  ).length;

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
          title="Income This Month"
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

      <Card>
        <h3 className="text-lg font-semibold text-slate-900">
          Statements
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Reviewed: {reviewedCount} •
          Needs Review: {needsReviewCount}
        </p>

        {statementItems.length ===
        0 ? (
          <p className="mt-3 text-sm text-green-600">
            ✅ No statements need review.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {statementItems.map(
              (statement) => (
                <div
                  key={`${statement.type}-${statement.name}`}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span>
                      {statement.name}
                    </span>

                    {statement.autoPayEnabled && (
                      <span
                        className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700"
                      >
                        AutoPay
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                  <div
                    className={`font-semibold ${
                      statement.daysUntil <= 0
                        ? "text-blue-600"
                        : "text-amber-600"
                    }`}
                  >
                    {statement.daysUntil <= 0
                      ? "Available"
                      : `Available in ${statement.daysUntil} day${
                          statement.daysUntil === 1
                            ? ""
                            : "s"
                        }`}
                  </div>

                  {statement.reviewed ? (
                    <div className="text-xs text-green-600">
                      ✅ Reviewed
                    </div>
                  ) : (
                    <div className="text-xs text-amber-600">
                      ⚠ Needs Review
                    </div>
                  )}
                </div>
                </div>
              )
            )}
          </div>
        )}
      </Card>  

      </Card>
      <FinancialTimeline
        bills={bills}
        debts={debts}
        income={income}
        updateBill={updateBill}
        updateDebt={updateDebt}
      />

      <AddBillModal
        open={isAddBillOpen}
        frequency="monthly"
        onClose={() => setIsAddBillOpen(false)}
        onSave={handleAddBill}
      />

    </PageContainer>
  );
}