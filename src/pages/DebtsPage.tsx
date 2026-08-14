import { formatCurrency } from "../utils/formatCurrency";
import { useState } from "react";
import { Plus } from "lucide-react";

import { Debt } from "../types/Debt";
import { useDebts } from "../hooks/useDebts";

import Button from "../components/common/Button";
import DebtCard from "../components/debts/DebtCard";
import AddDebtModal from "../components/debts/AddDebtModal";

export default function DebtsPage() {
  const {
    debts,
    addDebt,
    deleteDebt,
  } = useDebts();

  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] =
    useState<Debt | null>(null);

  const filteredDebts = debts.filter((debt) =>
    debt.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalDebt = debts.reduce(
    (sum, debt) => sum + debt.balance,
    0
  );

  const totalMinimumPayments = debts.reduce(
    (sum, debt) => sum + debt.minimumPayment,
    0
  );

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);

    // We'll wire the edit modal up next.
    console.log("Editing:", debt);
  };

  return (
    <div className="space-y-6 px-5 py-6 pb-32">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          Debts
        </h1>

        <p className="mt-2 text-lg text-slate-500">
          Track and manage your debts
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">

        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">
            Total Debt
          </p>

          <p className="mt-2 text-2xl font-bold">
            {formatCurrency(totalDebt)}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">
            Monthly Minimum
          </p>

          <p className="mt-2 text-2xl font-bold">
            {formatCurrency(totalMinimumPayments)}
          </p>
        </div>

      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search debts..."
        className="w-full rounded-xl border border-slate-200 p-4"
      />

      {/* Debt List */}
      {filteredDebts.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl">
            🏦
          </div>

          <h2 className="mt-5 text-2xl font-bold">
            No debts yet
          </h2>

          <p className="mt-2 text-slate-500">
            Tap the + button below to add your first debt.
          </p>

        </div>
      ) : (
        <div className="space-y-4">
          {filteredDebts.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              onEdit={handleEdit}
              onDelete={deleteDebt}
            />
          ))}
        </div>
      )}

      {/* Floating Add Button */}
      <Button
        type="button"
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full p-0 shadow-xl"
      >
        <Plus size={32} />
      </Button>

      {/* Add Modal */}
      <AddDebtModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addDebt}
      />
    </div>
  );
}