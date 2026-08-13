import { useState } from "react";
import { Plus } from "lucide-react";

import { Bill } from "../types/Bill";
import { useBills } from "../hooks/useBills";

import Button from "../components/common/Button";
import BillCard from "../components/bills/BillCard";
import AddBillModal from "../components/bills/AddBillModal";

export default function BillsPage() {
  const {
    bills,
    addBill,
    togglePaid,
    deleteBill,
  } = useBills();

  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);

  const filteredBills = bills.filter((bill) =>
    bill.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

const [editingBill, setEditingBill] =
  useState<Bill | null>(null);

const handleEdit = (bill: Bill) => {
  setEditingBill(bill);
};

  return (
    <div className="space-y-6 px-5 py-6 pb-32">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          Bills
        </h1>

        <p className="mt-2 text-lg text-slate-500">
          Track and manage your bills
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
        placeholder="Search bills..."
        className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

      {/* Bill List */}
      {filteredBills.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-md">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl">
            💳
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            {search ? "No bills found" : "No bills yet"}
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-slate-500">
            {search
              ? "Try a different search."
              : "Tap the + button below to add your first bill."}
          </p>

        </div>
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

      {/* Floating Add Button */}
      <Button
        type="button"
        onClick={() => setIsAddModalOpen(true)}
        aria-label="Add bill"
        className="fixed bottom-24 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full p-0 shadow-xl"
      >
        <Plus size={32} strokeWidth={2.5} />
      </Button>

      {/* Add Bill Modal */}
      <AddBillModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addBill}
      />

    </div>
  );
}