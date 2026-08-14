import { Debt } from "../../types/Debt";

interface DebtCardProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => void;
}

export default function DebtCard({
  debt,
  onEdit,
  onDelete,
}: DebtCardProps) {
  const progress =
    debt.originalBalance > 0
      ? Math.round(
          ((debt.originalBalance - debt.balance) /
            debt.originalBalance) *
            100
        )
      : 0;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md border border-slate-100">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            {debt.name}
          </h3>

          <p className="text-sm text-slate-500">
            {debt.type}
          </p>
        </div>

        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {debt.interestRate}% APR
        </span>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-sm">
          <span>Balance</span>

          <span className="font-semibold">
            ${debt.balance.toFixed(2)}
          </span>
        </div>

        <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{
              width: `${Math.min(progress, 100)}%`,
            }}
          />
        </div>

        <p className="mt-2 text-xs text-slate-500">
          {progress}% paid off
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-500">
            Minimum Payment
          </p>

          <p className="font-semibold">
            ${debt.minimumPayment.toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-slate-500">
            Due Date
          </p>

          <p className="font-semibold">
            {debt.dueDate}
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => onEdit(debt)}
          className="flex-1 rounded-xl bg-slate-100 py-2 font-medium hover:bg-slate-200"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(debt.id)}
          className="flex-1 rounded-xl bg-red-500 py-2 font-medium text-white hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
