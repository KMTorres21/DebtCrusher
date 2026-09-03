import { useState } from "react";
import { Plus } from "lucide-react";

import { Bill } from "../types/Bill";
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBill, setEditingBill] =
    useState<Bill | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "dueDate" | "statementDate">("dueDate");
  const filteredBills = bills.filter((bill) =>
    bill.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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

      <SearchBar
  value={search}
  onChange={setSearch}
  placeholder="Search bills..."
/>

<div className="flex items-center justify-end gap-2">
  <label
    htmlFor="bill-sort"
    className="text-sm font-semibold text-slate-600"
  >
    Sort by
  </label>

  <select
    id="bill-sort"
    value={sortBy}
    onChange={(event) =>
      setSortBy(
        event.target.value as
          | "name"
          | "dueDate"
          | "statementDate"
      )
    }
    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
  >
    <option value="name">Name</option>
    <option value="dueDate">Due Date</option>
    <option value="statementDate">
      Statement Date
    </option>
  </select>
</div>

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
        frequency={editingBill?.frequency ?? "monthly"}
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