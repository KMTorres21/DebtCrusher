import { useState } from "react";

import CalendarGrid from "../components/calendar/CalendarGrid";

import { useBills } from "../hooks/useBills";
import { useIncome } from "../hooks/useIncome";
import { useDebts } from "../hooks/useDebts";

import { Bill } from "../types/Bill";
import { Income } from "../types/Income";
import { Debt } from "../types/Debt";

import AddBillModal from "../components/bills/AddBillModal";
import AddIncomeModal from "../components/income/AddIncomeModal";
import AddDebtModal from "../components/debts/AddDebtModal";

export default function CalendarPage() {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const { bills, updateBill } = useBills();
  const { income, updateIncome } = useIncome();
  const { debts, updateDebt } = useDebts();

  const [editingBill, setEditingBill] =
    useState<Bill | null>(null);

  const [editingIncome, setEditingIncome] =
    useState<Income | null>(null);

  const [editingDebt, setEditingDebt] =
    useState<Debt | null>(null);

  const handlePreviousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((currentYear) => currentYear - 1);
      return;
    }

    setMonth((currentMonth) => currentMonth - 1);
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((currentYear) => currentYear + 1);
      return;
    }

    setMonth((currentMonth) => currentMonth + 1);
  };

  return (
    <>
      <div className="space-y-6 px-5 py-6 pb-32">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePreviousMonth}
            className="rounded-full px-3 py-2 hover:bg-slate-100"
          >
            ◀
          </button>

          <h1 className="text-3xl font-bold">
            {new Date(
              year,
              month
            ).toLocaleString("default", {
              month: "long",
            })}{" "}
            {year}
          </h1>

          <button
            type="button"
            onClick={handleNextMonth}
            className="rounded-full px-3 py-2 hover:bg-slate-100"
          >
            ▶
          </button>
        </div>

        <CalendarGrid
          year={year}
          month={month}
          bills={bills}
          income={income}
          debts={debts}
          onEditBill={setEditingBill}
          onEditIncome={setEditingIncome}
          onEditDebt={setEditingDebt}
        />
      </div>

      <AddBillModal
        open={editingBill !== null}
        bill={editingBill}
        onClose={() => setEditingBill(null)}
        onSave={(bill) => {
          updateBill(bill);
          setEditingBill(null);
        }}
      />

      <AddIncomeModal
        open={editingIncome !== null}
        income={editingIncome}
        onClose={() => setEditingIncome(null)}
        onSave={(item) => {
          updateIncome(item);
          setEditingIncome(null);
        }}
      />

      <AddDebtModal
        open={editingDebt !== null}
        debt={editingDebt}
        onClose={() => setEditingDebt(null)}
        onSave={(debt) => {
          updateDebt(debt);
          setEditingDebt(null);
        }}
      />
    </>
  );
}