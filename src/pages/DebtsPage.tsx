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

import DebtCard from "../components/debts/DebtCard";
import AddDebtModal from "../components/debts/AddDebtModal";

export default function DebtsPage() {
  const {
    debts,
    addDebt,
    updateDebt,
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

  function handleEdit(debt: Debt) {
    setEditingDebt(debt);
    setIsAddModalOpen(true); // Open the modal for editing
  }

  return (
    <PageContainer>

      <PageHeader
        title="Debts"
        subtitle="Track and manage your debts"
      />

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
        debt={editingDebt}
        onClose={() => {
          setEditingDebt(null);
          setIsAddModalOpen(false);
        }}
        onSave={(debt) => {
          if (editingDebt) {
            updateDebt(debt);
          } else {
            addDebt(debt);
          }
          setEditingDebt(null);
          setIsAddModalOpen(false);
        }}
      />

    </PageContainer>
  );
}