import { Pencil, Trash2, Calendar, DollarSign } from "lucide-react";

import { Income } from "../../types/Income";
import { formatCurrency } from "../../utils/formatCurrency";

interface IncomeCardProps {
  income: Income;
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
}

export default function IncomeCard({
  income,
  onEdit,
  onDelete,
}: IncomeCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-md">

      <div className="flex items-start justify-between">

        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {income.source}
          </h2>

          <div className="mt-2 flex items-center gap-2 text-slate-600">
            <DollarSign size={18} />
            <span className="font-semibold">
              {formatCurrency(income.amount)}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2 text-slate-600">
            <Calendar size={18} />
            <span>
              Next Pay: {income.nextPayDate}
            </span>
          </div>

          <div className="mt-3 inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold capitalize text-green-700">
            {income.frequency}
          </div>

          {income.notes && (
            <p className="mt-4 text-sm text-slate-500">
              {income.notes}
            </p>
          )}
        </div>

        <div className="flex gap-2">

          <button
            onClick={() => onEdit(income)}
            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
            aria-label="Edit income"
          >
            <Pencil size={20} />
          </button>

          <button
            onClick={() => onDelete(income.id)}
            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
            aria-label="Delete income"
          >
            <Trash2 size={20} />
          </button>

        </div>

      </div>

    </div>
  );
}
