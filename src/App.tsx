export default function App() {
  return (
    <main className="app">
      <header className="hero">
        <h1>💰 DebtCrusher</h1>
        <p>Take control of your bills.</p>
      </header>
 
      <section className="summary">
        <h2>This Month</h2>
 
        <div className="amount">$0.00</div>
 
        <p>No bills yet.</p>
 
        <button>Add First Bill</button>
      </section>
    </main>
  );
}