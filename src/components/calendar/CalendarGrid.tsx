import { useState } from "react";
import { Bill } from "../../types/Bill";
import { Income } from "../../types/Income";
import { Debt } from "../../types/Debt";
import { formatCurrency } from "../../utils/formatCurrency";
import { getBillOccurrences, getIncomeOccurrences } from "../../utils/calendarOccurrences";

interface Props {
  year: number;
  month: number;
  bills: Bill[];
  income: Income[];
  debts: Debt[];
  onEditBill: (bill: Bill) => void;
  onEditIncome: (income: Income) => void;
  onEditDebt: (debt: Debt) => void;
}

export default function CalendarGrid({
  year,
  month,
  bills,
  income,
  debts,
  onEditBill,
  onEditIncome,
  onEditDebt,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    null
  );

  const weekDays = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const getDateString = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

  const selectedBills = selectedDate
    ? bills.filter((bill) => getBillOccurrences(
      bill, year, month).includes(selectedDate))
    : [];

  const selectedIncome = selectedDate
    ? income.filter((item) => getIncomeOccurrences(
      item, year, month).includes(selectedDate))
    : [];

  const selectedDebts = selectedDate
    ? debts.filter((debt) => debt.dueDate === selectedDate)
    : [];

  const selectedIncomeTotal = selectedIncome.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const selectedBillsTotal = selectedBills.reduce(
    (sum, bill) => sum + bill.amount,
    0
  );

  const selectedDebtTotal = selectedDebts.reduce(
    (sum, debt) => sum + debt.minimumPayment,
    0
  );

  const selectedOutflow =
    selectedBillsTotal + selectedDebtTotal;

  const selectedNet =
    selectedIncomeTotal - selectedOutflow;

  const cells = [];

  for (let i = 0; i < startDay; i++) {
    cells.push(
      <div
        key={`blank-${i}`}
        className="min-h-[90px]"
      />
    );
  }

  for (let day = 1; day <= totalDays; day++) {
    const today = new Date();

    const dateString = getDateString(day);

    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day;

    const isSelected = selectedDate === dateString;

    const dayBills = bills.filter((bill) =>
  getBillOccurrences(bill, year, month).includes(dateString)
);

const dayIncome = income.filter((item) =>
  getIncomeOccurrences(item, year, month).includes(dateString)
);

    const dayDebts = debts.filter(
      (debt) => debt.dueDate === dateString
    );

    const hasEvents =
      dayBills.length > 0 ||
      dayIncome.length > 0 ||
      dayDebts.length > 0;

    cells.push(
      <button
        key={day}
        type="button"
        onClick={() =>
          setSelectedDate(
            isSelected ? null : dateString
          )
        }
        className={`min-h-[90px] w-full rounded-xl border bg-white p-2 text-left transition ${
          isSelected
            ? "border-blue-500 ring-2 ring-blue-200"
            : "border-slate-200 hover:border-blue-300"
        }`}
      >
        {/* Day Number */}
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
            isToday
              ? "bg-blue-600 text-white"
              : "text-slate-700"
          }`}
        >
          {day}
        </div>

        {/* Event Indicators */}
        {hasEvents && (
          <div className="mt-2 space-y-1">
            {dayBills.map((bill) => (
              <div
                key={bill.id}
                className={`truncate rounded px-2 py-1 text-xs font-medium text-white ${
                  bill.paid
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              >
                🧾 {bill.name}
              </div>
            ))}

            {dayIncome.map((item) => (
              <div
                key={item.id}
                className="truncate rounded bg-green-600 px-2 py-1 text-xs font-medium text-white"
              >
                💵 {item.source}
              </div>
            ))}

            {dayDebts.map((debt) => (
              <div
                key={debt.id}
                className="truncate rounded bg-orange-500 px-2 py-1 text-xs font-medium text-white"
              >
                💳 {debt.name}
              </div>
            ))}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-bold text-slate-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-7 gap-2">
        {cells}
      </div>

      {/* Selected Day */}
      {selectedDate && (
        <div className="rounded-2xl bg-white p-5 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {new Date(
                  `${selectedDate}T12:00:00`
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Financial activity
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="rounded-full px-3 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
            >
              Close
            </button>
          </div>

          {/* Summary */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-green-50 p-3">
              <p className="text-xs font-semibold text-green-700">
                Income
              </p>
              <p className="mt-1 font-bold text-green-700">
                {formatCurrency(selectedIncomeTotal)}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-3">
              <p className="text-xs font-semibold text-red-700">
                Outflow
              </p>
              <p className="mt-1 font-bold text-red-700">
                {formatCurrency(selectedOutflow)}
              </p>
            </div>

            <div
              className={`rounded-xl p-3 ${
                selectedNet >= 0
                  ? "bg-blue-50"
                  : "bg-orange-50"
              }`}
            >
              <p
                className={`text-xs font-semibold ${
                  selectedNet >= 0
                    ? "text-blue-700"
                    : "text-orange-700"
                }`}
              >
                Net
              </p>

              <p
                className={`mt-1 font-bold ${
                  selectedNet >= 0
                    ? "text-blue-700"
                    : "text-orange-700"
                }`}
              >
                {formatCurrency(selectedNet)}
              </p>
            </div>
          </div>

          {/* Bills */}
          {selectedBills.length > 0 && (
            <div className="mt-5">
              <h3 className="font-bold text-slate-900">
                Bills
              </h3>

              <div className="mt-2 space-y-2">
                {selectedBills.map((bill) => (
<div
  key={bill.id}
  className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
>
  <div className="min-w-0">
    <p className="font-semibold">
      🧾 {bill.name}
    </p>

    <p className="text-xs text-slate-500">
      {bill.paid ? "Paid" : "Due"}
    </p>
  </div>

  <div className="flex shrink-0 items-center gap-2">
    <span className="font-bold">
      {formatCurrency(bill.amount)}
    </span>

    <button
      type="button"
      onClick={() => onEditBill(bill)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
    >
      Edit
    </button>
  </div>
</div>
                ))}
              </div>
            </div>
          )}

          {/* Income */}
          {selectedIncome.length > 0 && (
            <div className="mt-5">
              <h3 className="font-bold text-slate-900">
                Income
              </h3>

              <div className="mt-2 space-y-2">
                {selectedIncome.map((item) => (
 <div
  key={item.id}
  className="flex items-center justify-between gap-3 rounded-xl bg-green-50 p-3"
>
  <p className="min-w-0 font-semibold">
    💵 {item.source}
  </p>

  <div className="flex shrink-0 items-center gap-2">
    <span className="font-bold text-green-700">
      {formatCurrency(item.amount)}
    </span>

    <button
      type="button"
      onClick={() => onEditIncome(item)}
      className="rounded-lg border border-green-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-green-50"
    >
      Edit
    </button>
  </div>
</div>
                ))}
              </div>
            </div>
          )}

{/* Debt Payments */}
{selectedDebts.length > 0 && (
  <div className="mt-5">
    <h3 className="font-bold text-slate-900">
      Debt Payments
    </h3>

    <div className="mt-2 space-y-2">
      {selectedDebts.map((debt) => (
        <div
          key={debt.id}
          className="flex items-center justify-between gap-3 rounded-xl bg-orange-50 p-3"
        >
          <p className="min-w-0 font-semibold">
            💳 {debt.name}
          </p>

          <div className="flex shrink-0 items-center gap-2">
            <span className="font-bold text-orange-700">
              {formatCurrency(debt.minimumPayment)}
            </span>

            <button
              type="button"
              onClick={() => onEditDebt(debt)}
              className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50"
            >
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
      )}
    </div>
  );
}