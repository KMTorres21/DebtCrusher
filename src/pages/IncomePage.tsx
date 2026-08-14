import { useState } from "react";
import { Plus } from "lucide-react";

import { Income } from "../types/Income";
import { useIncome } from "../hooks/useIncome";
import { formatCurrency } from "../utils/formatCurrency";

import Button from "../components/common/Button";
import IncomeCard from "../components/income/IncomeCard";
import AddIncomeModal from "../components/income/AddIncomeModal";

export default function IncomePage() {
  const {
    income,
    addIncome,
    deleteIncome,
  } = useIncome();

  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] =
    useState<Income | null>(null);

  const filteredIncome = income.filter((item) =>
    item.source.toLowerCase().includes(search.toLowerCase())
  );

  const totalIncome = income.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const nextPayday =
    income.length > 0
      ? [...income]
          .sort((a, b) =>
            a.nextPayDate.localeCompare(b.nextPayDate)
          )[0].nextPayDate
      : "None";

  const handleEdit = (item: Income) => {
    setEditingIncome(item);
    console.log("Editing income:", item);
  };

  return (
    <div className="space-y-6 px-5 py-6 pb-32">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          Income
        </h1>

        <p className="mt-2 text-lg text-slate-500">
          Track your income sources
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">

        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">
            Monthly Income
          </p>

          <p className="mt-2 text-2xl font-bold">
            {formatCurrency(totalIncome)}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">
            Next Payday
          </p>

          <p className="mt-2 text-lg font-bold">
            {nextPayday}
          </p>
        </div>

      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search income..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-slate-200 p-4"
      />

      {/* Income List */}
      {filteredIncome.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
            💵
          </div>

          <h2 className="mt-5 text-2xl font-bold">
            No income yet
          </h2>

          <p className="mt-2 text-slate-500">
            Tap the + button below to add your first income source.
          </p>

        </div>
      ) : (
        <div className="space-y-4">
          {filteredIncome.map((item) => (
            <IncomeCard
              key={item.id}
              income={item}
              onEdit={handleEdit}
              onDelete={deleteIncome}
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

      {/* Add Income Modal */}
      <AddIncomeModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addIncome}
      />
    </div>
  );
}