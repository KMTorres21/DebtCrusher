import { Bill } from "../../types/Bill";
import { Income } from "../../types/Income";
import { Debt } from "../../types/Debt";
import { getBillOccurrences,
         getIncomeOccurrences
} from "../../utils/calendarOccurrences";

interface Props {
  year: number;
  month: number;
  bills: Bill[];
  income: Income[];
  debts: Debt[];
  onEditBill?: (bill: Bill) => void;
  onEditIncome?: (income: Income) => void;
  onEditDebt?: (debt: Debt) => void;
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

    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day;

    const dateString = `${year}-${String(month + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    const dayBills = bills.filter(
      (bill) => 
      {
        const occurrences = getBillOccurrences(
          bill,
          year,
          month
        );
        return occurrences.includes(dateString);
      }
    );

    const dayIncome = income.filter(
      (item) => {
          const occurrences = getIncomeOccurrences(
            item,
            year,
            month
          );
          return occurrences.includes(dateString);
      }
    );

    const dayDebts = debts.filter(
      (debt) => debt.dueDate === dateString
    );

    cells.push(
      <div
        key={day}
        className="min-h-[90px] rounded-xl border border-slate-200 bg-white p-2"
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

        {/* Bills */}
        <div className="mt-2 space-y-1">
          {dayBills.map((bill) => (
            <button
              key={bill.id}
              type="button"
              onClick={() => onEditBill?.(bill)}
              className={`w-full truncate rounded px-2 py-1 text-left text-xs font-medium text-white ${
                bill.paid
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            >
              <div>🧾 {bill.name}</div>
              <div>
                ${bill.amount.toFixed(2)}
              </div>
            </button>
          ))}
        </div>

        {/* Income */}
        <div className="mt-1 space-y-1">
          {dayIncome.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onEditIncome?.(item)}
              className="w-full truncate rounded bg-green-600 px-2 py-1 text-left text-xs font-medium text-white"
            >
              <div>💵 {item.source}</div>
              <div>
                ${item.amount.toFixed(2)}
              </div>
            </button>
          ))}
        </div>

        {/* Debt Payments */}
        <div className="mt-1 space-y-1">
          {dayDebts.map((debt) => (
            <button
              key={debt.id}
              type="button"
              onClick={() => onEditDebt?.(debt)}
              className="w-full truncate rounded bg-orange-500 px-2 py-1 text-left text-xs font-medium text-white"
            >
              <div>💳 {debt.name}</div>
              <div>
                ${debt.minimumPayment.toFixed(2)}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
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

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {cells}
      </div>
    </div>
  );
}