import { Bill } from "../../types/Bill";

interface Props {
  bills: Bill[];
}

export default function UpcomingBills({ bills }: Props) {
  const upcomingBills = [...bills]
    .filter((bill) => !bill.paid)
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() -
        new Date(b.dueDate).getTime()
    )
    .slice(0, 5);

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <h2 className="text-xl font-bold">
        Upcoming Bills
      </h2>

      {upcomingBills.length === 0 ? (
        <p className="mt-4 text-slate-500">
          No upcoming bills 🎉
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {upcomingBills.map((bill) => (
            <div
              key={bill.id}
              className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
            >
              <div>
                <p className="font-semibold">
                  {bill.name}
                </p>

                <p className="text-sm text-slate-500">
                  Due {bill.dueDate}
                </p>
              </div>

              <div className="font-bold">
                ${bill.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
