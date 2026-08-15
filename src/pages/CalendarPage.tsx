import { useState } from "react";
import CalendarGrid from "../components/calendar/CalendarGrid";

export default function CalendarPage() {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  return (
    <div className="space-y-6 px-5 py-6 pb-32">
      <div className="flex items-center justify-between">
        <button onClick={() => setMonth(month - 1)}>
          ◀
        </button>

        <h1 className="text-3xl font-bold">
          {new Date(year, month).toLocaleString("default", {
            month: "long",
          })}{" "}
          {year}
        </h1>

        <button onClick={() => setMonth(month + 1)}>
          ▶
        </button>
      </div>

      <CalendarGrid
        year={year}
        month={month}
      />
    </div>
  );
}