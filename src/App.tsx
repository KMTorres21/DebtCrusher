import "./index.css";
import { useBills } from "./hooks/useBills";
import BillList from "./components/bills/BillList";
import AddBillForm from "./components/bills/AddBillForm";
import StatCard from "./components/common/StatCard";
 
export default function App() {
  const { bills, addBill, deleteBill, togglePaid } = useBills();
 
  const monthlyTotal = bills.reduce(
    (sum, bill) => sum + bill.amount,
    0
  );
 
  const paidCount = bills.filter((bill) => bill.paid).length;
 
  return (
    <main className="app">
      <header className="hero">
        <h1>💰 DebtCrusher</h1>
        <p>Take control of your bills.</p>
      </header>
 
      <section className="summary">
        <h2>This Month</h2>
 
        <div className="amount">
          ${monthlyTotal.toFixed(2)}
        </div>
 
        <p>
          {paidCount} of {bills.length} bills paid
        </p>
      </section>
 
      <br />
 
      <AddBillForm onAdd={addBill} />
 
      <br />
 
      <BillList
        bills={bills}
        onDelete={deleteBill}
        onTogglePaid={togglePaid}
      />
    </main>
  );
}
