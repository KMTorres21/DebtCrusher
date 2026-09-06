import type { ActivityEntry }
  from "../../types/ActivityEntry";

interface ActivityHistoryProps {
  items?: ActivityEntry[];
}

function formatActivityDate(
  dateString: string
): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ActivityHistory({
  items = [],
}: ActivityHistoryProps) {

  const sortedItems = [...items].sort(
    (a, b) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime()
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-800">
        Activity History
      </h3>

      {sortedItems.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          No activity has been recorded yet.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {sortedItems.map((item) => (
            <div
              key={item.id}
              className="border-l-2 border-blue-500 pl-4"
            >
              <p className="font-medium text-slate-800">
                {item.action}
              </p>

              {item.details && (
                <p className="mt