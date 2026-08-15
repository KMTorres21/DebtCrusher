interface Props {
  year: number;
  month: number;
}

export default function CalendarGrid({
  year,
  month,
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
    cells.push(<div key={`blank-${i}`} />);
  }

  for (let day = 1; day <= totalDays; day++) {
    cells.push(
      <div
        key={day}
        className="min-h-[90px] rounded-xl border border-slate-200 bg-white p-2"
      >
        <div className="text-sm font-semibold">
          {day}
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