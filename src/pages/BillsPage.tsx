import { useState } from "react";
import { Plus } from "lucide-react";

import { Bill, BillCategory } from "../types/Bill";
import { useBills } from "../hooks/useBills";

import Button from "../components/common/Button";
import BillCard from "../components/bills/BillCard";
import AddBillModal from "../components/bills/AddBillModal";

import PageContainer from "../components/common/PageContainer";
import PageHeader from "../components/common/PageHeader";
import SearchBar from "../components/common/SearchBar";
import EmptyState from "../components/common/EmptyState";

export default function BillsPage() {
  const {
    bills,
    addBill,
    updateBill,
    togglePaid,
    deleteBill,
  } = useBills();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<BillCategory | "All">("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBill, setEditingBill] =
    useState<Bill | null>(null);
  const categories: (BillCategory[] = [
    "Housing",
    "Utilities",
    "Transportation",
    "Insurance",
    "Phone",
    "Internet",
    "Medical",
    "Credit Card",
    "Loan",
    "Subscription",
    "Other",
  ];

  const filteredBills = bills.filter((bill) => {
    const matchesSearch = bill.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || bill.category === categoryFilter;
  
  return matchesSearch && matchesCategory;
  });

  function handleEdit(bill: Bill) {
    setEditingBill(bill);
    setIsAddModalOpen(true);
  }

  return (
    <PageContainer>

      <PageHeader
        title="Bills"
        subtitle="Track and manage your bills"
      />

<select
  value={categoryFilter}
  onChange={(event) =>
    setCategoryFilter(
      event.target.value as BillCategory | "All"
    )
  }
  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
>
  <option value="All">All Categories</option>

  {categories.map((category) => (
    <option key={category} value={category}>
      {category}
    </option>
  ))}
</select>

      {filteredBills.length === 0 ? (
        <EmptyState
          icon="💳"
          title={search ? "No bills found" : "No bills yet"}
          description={
            search
              ? "Try a different search."
              : "Tap the + button below to add your first bill."
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredBills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              onTogglePaid={togglePaid}
              onEdit={handleEdit}
              onDelete={deleteBill}
            />
          ))}
        </div>
      )}

      <Button
        type="button"
        aria-label="Add bill"
        onClick={() => {
          setEditingBill(null);
          setIsAddModalOpen(true);
        }}
        className="fixed bottom-24 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full p-0 shadow-xl"
      >
        <Plus size={32} strokeWidth={2.5} />
      </Button>

      <AddBillModal
        open={isAddModalOpen}
        bill={editingBill}
        onClose={() => {
          setEditingBill(null);
          setIsAddModalOpen(false);
        }}
        onSave={(bill) => {
          if (editingBill) {
            updateBill(bill);
          } else {
            addBill(bill);
          }

          setEditingBill(null);
          setIsAddModalOpen(false);
        }}
      />

    </PageContainer>
  );
}