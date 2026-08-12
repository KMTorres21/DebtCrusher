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
            background: "#fff",
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          <h3>{bill.name}</h3>
 
          <p>${bill.amount.toFixed(2)}</p>
 
          <p>Due: {bill.dueDay}</p>
 
          <button onClick={() => onTogglePaid(bill.id)}>
            {bill.paid ? "Paid ✅" : "Mark Paid"}
          </button>
 
          <button
            onClick={() => onDelete(bill.id)}
            style={{ marginLeft: 10 }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
