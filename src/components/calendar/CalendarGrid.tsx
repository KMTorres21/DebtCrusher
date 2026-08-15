import { Bill } from "../../types/Bill";
import { Income } from "../../types/Income";

interface Props {
  year: number;
  month: number;
  bills: Bill[];
  income: Income[];
}

export default function CalendarGrid({
  year,
  month,
  bills,
  income,
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

  const cells = []

  for (let i = 0; i < startDay; i++) {
  cells.push(<div key={`blank-${i}`} />);
}

  for (let day = 1; day <= totalDays; day++) {
  const isToday = (() => {
    const today = new Date();

    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  })();
const dateString =
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const dayIncome = income.filter(
  (item) => item.nextPayDate === dateString
);

const dayBills = bills.filter(
  (bill) => bill.dueDate === dateString
);
  cells.push(
    <div
      key={day}
      className="min-h-[90px] rounded-xl border border-slate-200 bg-white p-2"
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
          isToday
            ? "bg-blue-600 text-white"
            : "text-slate-700"
        }`}
      >
        {day}
      </div>
<div className="mt-1 space-y-1">
  {dayIncome.map(...)}
</div>
<div className="mt-1 space-y-1">
  {dayIncome.map((item) => (
    <div
      key={item.id}
      className="truncate rounded bg-green-500 px-2 py-1 text-xs text-white"
    >
      💵 {item.source}
    </div>
  ))}
</div>
    </div>
  );
}
  return (
    <div className="space-y-2">
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

      <div className="grid grid-cols-7 gap-2">
        {cells}
      </div>
    </div>
  );
}