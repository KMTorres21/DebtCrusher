import { Bill } from "../../types/Bill";
 
interface Props {
  bills: Bill[];
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
}
 
export default function BillList({
  bills,
  onTogglePaid,
  onDelete,
}: Props) {
  if (bills.length === 0) {
    return <p>No bills yet. Add your first bill below.</p>;
  }
 
  return (
    <div>
      {bills.map((bill) => (
        <div
  key={bill.id}
  style={{
    background: bill.paid ? "#ecfdf5" : "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,.08)",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <h3 style={{ margin: 0 }}>
      {bill.category === "Utilities" && "⚡ "}
      {bill.category === "Housing" && "🏠 "}
      {bill.category === "Insurance" && "🛡️ "}
      {bill.category === "Credit Card" && "💳 "}
      {bill.category === "Medical" && "❤️ "}
      {bill.category === "Subscriptions" && "🎬 "}
      {bill.category === "Other" && "📄 "}
      {bill.name}
    </h3>
 
    <span
      style={{
        background: "#e5e7eb",
        padding: "4px 10px",
        borderRadius: 20,
        fontSize: 12,
      }}
    >
      Due {bill.dueDay}
    </span>
  </div>
 
  <p
    style={{
      fontSize: 24,
      fontWeight: "bold",
      margin: "12px 0 4px",
    }}
  >
    ${bill.amount.toFixed(2)}
  </p>
 
  <p
    style={{
      color: "#666",
      marginTop: 0,
      marginBottom: 16,
    }}
  >
    {bill.category}
  </p>
 
  <div
    style={{
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
    }}
  >
    <button
      onClick={() => onTogglePaid(bill.id)}
      style={{
        padding: "6px 12px",
        fontSize: 14,
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
      }}
    >
      {bill.paid ? "✅ Paid" : "✓ Mark Paid"}
    </button>
 
    <button
      onClick={() => onDelete(bill.id)}
      style={{
        padding: "6px 12px",
        fontSize: 14,
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        background: "#ef4444",
        color: "white",
      }}
    >
      🗑 Delete
    </button>
  </div>
</div>
