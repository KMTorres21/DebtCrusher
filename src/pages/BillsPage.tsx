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

  const filteredBills = bills
  .filter((bill) =>
    bill.name
      .toLowerCase()
      .includes(search.toLowerCase())
  )
  .sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(
        b.name,
        undefined,
        { sensitivity: "base" }
      );
    }

    const aDate =
      sortBy === "statementDate"
        ? a.statementDate
        : a.dueDate;

    const bDate =
      sortBy === "statementDate"
        ? b.statementDate
        : b.dueDate;

    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;

    return aDate.localeCompare(bDate);
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
  <option value="name">
    Name
  </option>

  <option value="dueDate">
    Due Date
  </option>

  <option value="statementDate">
    Statement Date
  </option>
</select>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search bills..."
      />

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