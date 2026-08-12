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

  const paidAmount = bills
  .filter((bill) => bill.paid)
  .reduce((sum, bill) => sum + bill.amount, 0);
 
  const remainingAmount = monthlyTotal - paidAmount;
 
  const dueThisWeek = bills.filter(
  (bill) => bill.dueDay >= 1 && bill.dueDay <= 7 && !bill.paid
).length;
 
  return (
    <main className="app">
      <header className="hero">
        <h1>💰 DebtCrusher</h1>
        <p>Take control of your bills.</p>
      </header>
 
<section
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
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
