import { useState } from "react";
import CalendarGrid from "../components/calendar/CalendarGrid";
import { useBills } from "../hooks/useBills";
import { useIncome } from "../hooks/useIncome";
import { useDebts } from "../hooks/useDebts";
import { buildCalendarEvents } from "../utils/calendarEvents";

export default function CalendarPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const { bills } = useBills();
  const { income } = useIncome();
  const { debts } = useDebts();
  const events = buildCalendarEvents(
  bills,
  income,
  debts
);
  function goToPreviousMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((current) => current - 1);
    } else {
      setMonth((current) => current - 1)
    }
  }
  function goToNextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((current) => current + 1);
    } else {
      setMonth((current) => current + 1);
    }
  }
  return (
    <div className="space-y-6 px-5 py-6 pb-32">
      <div className="flex items-center justify-between">
        <button onClick={goToPreviousMonth}>
          ◀
        </button>

        <h1 className="text-3xl font-bold">
          {new Date(year, month).toLocaleString("default", {
            month: "long",
          })}{" "}
          {year}
        </h1>

        <button onClick={goToNextMonth}>
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
    )
    </div>
  );
}