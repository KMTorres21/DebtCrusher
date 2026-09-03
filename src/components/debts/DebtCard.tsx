import { Debt } from "../../types/Debt"
import { formatCurrency } from "../../utils/formatCurrency";

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
  const currentBalance = debt.statementBalance ?? debt.balance ?? 0;
  const progress = {isCreditCard && debt.creditLimit ? (
  <div className="mt-5">
    <div className="flex items-end justify-between gap-4">
      <p className="text-sm font-medium text-slate-600">
        Credit Utilization
      </p>

      <div className="text-right">
        <p className="text-xs text-slate-500">
          Credit Limit
        </p>

        <p className="font-semibold text-slate-900">
          {formatCurrency(debt.creditLimit)}
        </p>
      </div>
    </div>

    <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-green-500 transition-all"
        style={{
          width: `${Math.min(
            Math.max(utilization, 0),
            100
          )}%`,
        }}
      />
    </div>

    <div className="mt-2 flex items-start justify-between gap-4">
      <p className="text-xs font-semibold text-green-700">
        {utilization}% utilized
      </p>

      <div className="text-right">
        <p className="text-xs text-slate-500">
          Statement Balance
        </p>

        <p className="text-sm font-semibold text-slate-900">
          {formatCurrency(currentBalance)}
        </p>
      </div>
    </div>
  </div>
) : (
  // keep your existing payoff-progress section here
)}

        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {debt.interestRate}% APR
        </span>
      </div>

      <div className="mt-5">
  {/* Progress header */}
  <div className="flex items-end justify-between gap-4">
    <p className="text-sm font-medium text-slate-600">
      Payoff Progress
    </p>

    <div className="text-right">
      <p className="text-xs text-slate-500">
        Original Balance
      </p>

      <p className="text-xs font-semibold text-slate-900">
        {formatCurrency(debt.originalBalance)}
      </p>
    </div>
  </div>

  {/* Progress bar */}
  <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
    <div
      className="h-full rounded-full bg-green-500 transition-all"
      style={{
        width: `${Math.min(
          Math.max(progress, 0),
          100
        )}%`,
      }}
    />
  </div>

  {/* Progress details */}
  <div className="mt-2 flex items-start justify-between gap-4">
    <p className="text-xs font-semibold text-green-700">
      {progress}% paid off
    </p>

    <div className="text-right">
      <p className="text-xs text-slate-500">
        Current Balance
      </p>

      <p className="text-xs font-semibold text-slate-900">
        {formatCurrency(currentBalance)}
      </p>
    </div>
  </div>
</div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-500">
            Minimum Payment
          </p>

          <p className="font-semibold">
       {formatCurrency(debt.minimumPayment)}
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
