import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Income } from "../types/Income";
import { useIncome } from "../hooks/useIncome";
import { formatCurrency } from "../utils/formatCurrency";

import Button from "../components/common/Button";
import PageContainer from "../components/common/PageContainer";
import PageHeader from "../components/common/PageHeader";
import SearchBar from "../components/common/SearchBar";
import StatCard from "../components/common/StatCard";
import EmptyState from "../components/common/EmptyState";
import { getIncomeOccurrences } from "../utils/calendarOccurrences";
import IncomeCard from "../components/income/IncomeCard";
import AddIncomeModal from "../components/income/AddIncomeModal";

export default function IncomePage() {
  const {
  income,
  addIncome,
  updateIncome,
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

  const nextPayday = (() => {
  if (income.length === 0) {
    return "None";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates: string[] = [];

  for (let offset = 0; offset <= 12; offset++) {
    const targetDate = new Date(
      today.getFullYear(),
      today.getMonth() + offset,
      1
    );

    const occurrences = income.flatMap((item) =>
      getIncomeOccurrences(
        item,
        targetDate.getFullYear(),
        targetDate.getMonth()
      )
    );

    dates.push(...occurrences);
  }

  const futureDates = dates
    .filter((date) => {
      const occurrenceDate = new Date(
        `${date}T12:00:00`
      );

      return occurrenceDate >= today;
    })
    .sort();

  return futureDates.length > 0
    ? futureDates[0]
    : "None";
})();

  const handleEdit = (item: Income) => {
    setEditingIncome(item);
    setIsAddModalOpen(true);
  
    // We'll wire editing into the modal next.
    console.log("Editing income:", item);
  };

  return (
    <PageContainer>

      <PageHeader
        title="Income"
        subtitle="Track your income sources"
      />

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Monthly Income"
          value={formatCurrency(totalIncome)}
          valueClassName="text-green-600"
        />

        <StatCard
          title="Next Payday"
          value={nextPayday}
        />
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search income..."
      />

      {filteredIncome.length === 0 ? (
        <EmptyState
          icon="💵"
          title="No income yet"
          description="Tap the + button below to add your first income source."
        />
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

      <Button
        type="button"
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full p-0 shadow-xl"
      >
        <Plus size={32} />
      </Button>

      <AddIncomeModal
  open={isAddModalOpen}
  income={editingIncome}
  onClose={() => {
    setEditingIncome(null);
    setIsAddModalOpen(false);
  }}
  onSave={(income) => {
    if (editingIncome) {
      updateIncome(income);
    } else {
      addIncome(income);
    }

    setEditingIncome(null);
    setIsAddModalOpen(false);
  }}
/>

    </PageContainer>
  );
}