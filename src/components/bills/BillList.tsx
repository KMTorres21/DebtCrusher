import { Bill } from "../../types/Bill";
import { getDueDateInfo } from "../../utils/dueDate";
import { sortBills } from "../../utils/sortBills";

interface Props {
  bills: Bill[];
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function BillList({
  bills,
  onTogglePaid,
  onDelete,
}: Props) {
  const sortedBills = sortBills(bills);

  if (sortedBills.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No bills yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedBills.map((bill) => {
        const dueInfo = getDueDateInfo(bill.dueDate);

        return (
          <div
            key={bill.id}
            className={`rounded-xl border p-4 shadow-sm transition
              ${
                bill.paid
                  ? "bg-green-50 border-green-300"
                  : dueInfo.isOverdue
                  ? "bg-red-50 border-red-400"
                  : "bg-white border-gray-200"
              }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-lg">{bill.name}</h2>

                <p className="text-sm text-gray-500">
                  {bill.category}
                </p>

                <p className="text-sm mt-1">
                  Due: {dueInfo.formattedDate}
                </p>

                {!bill.paid && dueInfo.isOverdue && (
                  <p className="text-red-600 text-sm font-semibold">
                    Overdue by {dueInfo.daysOverdue} day
                    {dueInfo.daysOverdue !== 1 ? "s" : ""}
                  </p>
                )}

                {!bill.paid && !dueInfo.isOverdue && (
                  <p className="text-gray-500 text-sm">
                    {dueInfo.daysUntilDue} day
                    {dueInfo.daysUntilDue !== 1 ? "s" : ""} remaining
                  </p>
                )}
              </div>

              <div className="text-right">
                <div className="text-xl font-bold">
                  ${bill.amount.toFixed(2)}
                </div>

                <div
                  className={`text-sm font-semibold ${
                    bill.paid
                      ? "text-green-600"
                      : "text-orange-500"
                  }`}
                >
                  {bill.paid ? "Paid" : "Unpaid"}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onTogglePaid(bill.id)}
                className={`flex-1 rounded-lg px-4 py-2 text-white transition
                  ${
                    bill.paid
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
              >
                {bill.paid ? "Mark Unpaid" : "Mark Paid"}
              </button>

              <button
                onClick={() => onDelete(bill.id)}
                className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 transition"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}