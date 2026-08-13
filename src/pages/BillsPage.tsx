import { useState } from "react";
import { Plus } from "lucide-react";
 
import { Bill } from "../types/Bill";
import { useBills } from "../hooks/useBills";
 
import Button from "../components/common/Button";
import BillCard from "../components/bills/BillCard";
 
export default function BillsPage() {
  const {
    bills,
    togglePaid,
    deleteBill,
  } = useBills();
 
  const [search, setSearch] = useState("");
 
  const filteredBills = bills.filter((bill) =>
    bill.name.toLowerCase().includes(search.toLowerCase())
  );
 
  const handleEdit = (bill: Bill) => {
    console.log("Edit bill:", bill);
  };
 
  return (
    <div className="space-y-6">
 
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Bills
        </h1>
 
        <p className="text-slate-500 mt-1">
          Track and manage your bills
        </p>
      </div>
 
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search bills..."
        className="w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
 
      {/* Bills */}
      {filteredBills.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-md">
          <div className="text-5xl mb-4">
            💳
          </div>
 
          <h2 className="text-xl font-semibold text-slate-900">
            {search ? "No bills found" : "No bills yet"}
          </h2>
 
          <p className="mt-2 text-slate-500">
            {search
              ? "Try a different search."
              : "Add your first bill using the + button."}
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
        className="fixed bottom-24 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full p-0 shadow-xl"
      >
        <Plus size={32} strokeWidth={2.5} />
      </Button>
 
    </div>
  );
}
 
