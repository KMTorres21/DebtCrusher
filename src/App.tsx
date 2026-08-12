import { Bill } from "./types/Bill";
import { useState } from "react";
import "./index.css";
import { useBills } from "./hooks/useBills";
import BillList from "./components/bills/BillList";
import AddBillForm from "./components/bills/AddBillForm";
import StatCard from "./components/common/StatCard";
 
export default function App() {
  const { 
   bills, 
   addBill, 
   updateBill,
   deleteBill, 
   togglePaid,
  } = useBills();
 const [editingBill, setEditingBill] =
  useState<Bill | null>(null);
  const [showAddBill, setShowAddBill] = useState(false);
 
  const monthlyTotal = bills.reduce(
    (sum, bill) => sum + bill.amount,
    0
  );
 
  const paidAmount = bills
    .filter((bill) => bill.paid)
    .reduce((sum, bill) => sum + bill.amount, 0);
 
  const remainingAmount = monthlyTotal - paidAmount;
 
  const dueThisWeek = bills.filter(
    (bill) =>
      bill.dueDay >= 1 &&
      bill.dueDay <= 7 &&
      !bill.paid
  ).length;
 
  function handleAddBill(
    bill: Parameters<typeof addBill>[0]
  ) {
    addBill(bill);
    setShowAddBill(false);
  }
 
  return (
    <main className="app">
      <header className="hero">
        <h1>💰 DebtCrusher</h1>
        <p>Take control of your bills.</p>
      </header>
 
      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <StatCard
          title="Monthly Total"
          value={`$${monthlyTotal.toFixed(2)}`}
        />
 
        <StatCard
          title="Paid"
          value={`$${paidAmount.toFixed(2)}`}
        />
 
        <StatCard
          title="Remaining"
          value={`$${remainingAmount.toFixed(2)}`}
        />
 
        <StatCard
          title="Due This Week"
          value={dueThisWeek}
        />
      </section>
 
      <section>
        <h2 style={{ marginBottom: "16px" }}>Bills</h2>
 
        <BillList
          bills={bills}
          onDelete={deleteBill}
          onTogglePaid={togglePaid}
          onEdit={setEditingBill}
        />
      </section>
 
      {/* Floating Add Bill Button */}
      <button
        className="floating-add-button"
        onClick={() => setShowAddBill(true)}
        aria-label="Add Bill"
      >
        +
      </button>
 
      {/* Add Bill Modal */}
      {showAddBill && (
        <div
          className="modal-backdrop"
          onClick={() => setShowAddBill(false)}
        >
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Add Bill</h2>
 
              <button
                className="modal-close"
                onClick={() => setShowAddBill(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
 
            <AddBillForm onAdd={handleAddBill} />
          </div>
        </div>
      )}
    </main>
  );
}
 
