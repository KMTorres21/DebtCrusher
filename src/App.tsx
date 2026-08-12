import { useBills } from "./hooks/useBills";
import BillList from "./components/bills/BillList";
 
export default function App() {
  const { bills, addBill, deleteBill, togglePaid } = useBills();
 
  function addSampleBill() {
    addBill({
      name: "Electric",
      amount: 125.75,
      dueDay: 15,
      paid: false,
      category: "Utilities",
      notes: "",
    });
  }
 
  const monthlyTotal = bills.reduce(
    (sum, bill) => sum + bill.amount,
    0
  );
 
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
 
        <button onClick={addSampleBill}>
          Add Sample Bill
        </button>
      </section>
 
      <br />
 
      <BillList
        bills={bills}
        onDelete={deleteBill}
        onTogglePaid={togglePaid}
      />
    </main>
  );
}
