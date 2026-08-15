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