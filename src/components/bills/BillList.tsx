import { useState } from "react";
import { Bill } from "../../types/Bill";
import { getDueDateInfo } from "../../utils/dueDate";
import { sortBills } from "../../utils/sortBills";
 
interface Props {
  bills: Bill[];
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (bill: Bill) => void;
}
 
export default function BillList({
  bills,
  onTogglePaid,
  onDelete,
  onEdit,
}: Props) {
  if (bills.length === 0) {
    return <p>No bills yet. Add your first bill below.</p>;
  }

   const sortedBills = sortBills(bills);
   const [showPaid, setShowPaid] = useState(false);
  
  return (
    <div>
      <>
       <h2>Active Bills</h2>
       {activeBills.map((bill) => (
        const dueInfo = getDueDateInfo(bill);
        const sortedBills = sortBills(bills);
        const activeBills = sortedBills.filter((bill) => !bill.paid);
        const paidBills = sortedBills.filter((bill) => bill.paid);
        return (
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
                gap: 12,
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
                  background:
                    dueInfo.status === "paid"
                      ? "#dcfce7"
                      : dueInfo.status === "overdue"
                      ? "#fee2e2"
                      : dueInfo.status === "today"
                      ? "#fed7aa"
                      : dueInfo.status === "soon"
                      ? "#fef3c7"
                      : "#dbeafe",
 
                  color:
                    dueInfo.status === "paid"
                      ? "#166534"
                      : dueInfo.status === "overdue"
                      ? "#b91c1c"
                      : dueInfo.status === "today"
                      ? "#9a3412"
                      : dueInfo.status === "soon"
                      ? "#92400e"
                      : "#1e40af",
 
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {dueInfo.label}
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
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => onEdit(bill)}
                style={{
                  padding: "6px 12px",
                  fontSize: 14,
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                }}
              >
                ✏️ Edit
              </button>
 
              <button
                onClick={() => onTogglePaid(bill.id)}
                style={{
                  padding: "6px 12px",
                  fontSize: 14,
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: bill.paid
                    ? "#dcfce7"
                    : "#f0fdf4",
                  color: "#166534",
                }}
              >
                {bill.paid ? "✓ Paid" : "✓ Mark Paid"}
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
        );
      })}
    </div>
  );
}
