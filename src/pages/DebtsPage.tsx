import { useState } from "react";
import { Plus } from "lucide-react";

import { Debt } from "../types/Debt";
import { useDebts } from "../hooks/useDebts";
import { formatCurrency } from "../utils/formatCurrency";

import Button from "../components/common/Button";
import PageContainer from "../components/common/PageContainer";
import PageHeader from "../components/common/PageHeader";
import SearchBar from "../components/common/SearchBar";
import EmptyState from "../components/common/EmptyState";
import StatCard from "../components/common/StatCard";
import { useNavigate } from "react-router-dom";
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

  const navigate= useNavigate();

  function handleEdit(debt: Debt) {
    setEditingDebt(debt);

    // Edit functionality will be completed next.
    console.log("Editing:", debt);
  }

  return (
    <PageContainer>

      <PageHeader
        title="Debts"
        subtitle="Track and manage your debts"
      />

      <button
        type="button"
        onClick={() => navigate("/debt-planner")}
        className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-left font-semibold text-white shadow transition hover:bg-slate-800"
      >
        Debt Payoff Plan
      </button>

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Total Debt"
          value={formatCurrency(totalDebt)}
        />

        <StatCard
          title="Monthly Minimum"
          value={formatCurrency(totalMinimumPayments)}
        />
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search debts..."
      />

      {filteredDebts.length === 0 ? (
        <EmptyState
          icon="🏦"
          title="No debts yet"
          description="Tap the + button below to add your first debt."
        />
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

      <Button
        type="button"
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full p-0 shadow-xl"
      >
        <Plus size={32} />
      </Button>

      <AddDebtModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addDebt}
      />

    </PageContainer>
  );
}