import { useState } from "react";
import { Plus } from "lucide-react";

import { Bill } from "../types/Bill";
import { useBills } from "../hooks/useBills";
import { useDisplaySettings } from "../hooks/useDisplaySettings";
import Button from "../components/common/Button";
import BillCard from "../components/bills/BillCard";
import AddBillModal from "../components/bills/AddBillModal";
import { Debt } from "../types/Debt";
import { useDebts } from "../hooks/useDebts";
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
  const { addDebt } = useDebts();
  const {
    settings: displaySettings}
     = useDisplaySettings();

  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBill, setEditingBill] =
    useState<Bill | null>(null);
  const [sortBy, setSortBy] = useState<
  "name" | "dueDate" | "statementDate"
>(() => {
  const saved = localStorage.getItem(
    "debtSortBy"
  );

  if (
    saved === "name" ||
    saved === "dueDate" ||
    saved === "statementDate"
  ) {
    return saved;
  }

  return "dueDate";
});
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

  function handleConvertToDebt(bill: Bill) {
      const confirmed = window.confirm(
        `Convert "${bill.name}" to a Debt?\n\nThe Bill will be removed and a new Debt will be created.`
      );
      console.log("CONFIRMED?", confirmed);
      if (!confirmed) return;

      const now = new Date().toISOString();

      const newDebt: Debt = {
        id: crypto.randomUUID(),

        name: bill.name,
        type: "Credit Card",

        balance:
          bill.statementBalance ??
          bill.amount,

        originalBalance:
          bill.statementBalance ??
          bill.amount,

        statementBalance:
          bill.statementBalance,

        minimumPayment:
          bill.amount,

        statementDate:
          bill.statementDate,

        dueDate:
          bill.dueDate,

        interestRate: 0,

        notes: [
          bill.notes,
          `Converted from Bill on ${new Date().toLocaleDateString()}`
          ]
          .filter(Boolean)
          .join("\n\n"),

        createdAt: now,
        updatedAt: now,
      };

      addDebt(newDebt);
      deleteBill(bill.id);
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
            onChange={(event) => {
        const value =
          event.target.value as
            | "name"
            | "dueDate"
            | "statementDate";

        setSortBy(value);

        localStorage.setItem(
          "debtSortBy",
          value
        );
      }}
      
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
              showStatementDate={displaySettings.showBillStatementDate}
              onTogglePaid={togglePaid}
              onEdit={handleEdit}
              onDelete={deleteBill}
              onConvertToDebt={handleConvertToDebt}
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