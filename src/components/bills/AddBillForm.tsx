import { useEffect, useState } from "react";
import { Bill } from "../../types/Bill";
 
interface Props {
  onAdd: (
    bill: Omit<Bill, "id" | "createdAt">
  ) => void;
  editingBill?: Bill | null;
  onUpdate?: (
    id: string,
    bill: Omit<Bill, "id" | "createdAt">
  ) => void;
  onCancel?: () => void;
}
 
export default function AddBillForm({
  onAdd,
  editingBill = null,
  onUpdate,
  onCancel,
}: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [category, setCategory] = useState("Utilities");
  const [paid, setPaid] = useState(false);
  const [recurring, setRecurring] = useState(true);
  const [autoPay, setAutoPay] = useState(false);
  const [notes, setNotes] = useState("");
 
  useEffect(() => {
    if (editingBill) {
      setName(editingBill.name);
      setAmount(editingBill.amount.toString());
      setDueDay(editingBill.dueDay.toString());
      setCategory(editingBill.category);
      setPaid(editingBill.paid);
      setRecurring(editingBill.recurring);
      setAutoPay(editingBill.autoPay);
      setNotes(editingBill.notes);
    } else {
      resetForm();
    }
  }, [editingBill]);
 
  function resetForm() {
    setName("");
    setAmount("");
    setDueDay("");
    setCategory("Utilities");
    setPaid(false);
    setRecurring(true);
    setAutoPay(false);
    setNotes("");
  }
 
  function submit(event: React.FormEvent) {
    event.preventDefault();
 
    if (!name.trim() || !amount || !dueDay) {
      return;
    }
 
    const bill = {
      name: name.trim(),
      amount: Number(amount),
      dueDay: Number(dueDay),
      category,
      paid,
      recurring,
      autoPay,
      notes,
    };
 
    if (editingBill && onUpdate) {
      onUpdate(editingBill.id, bill);
    } else {
      onAdd(bill);
    }
 
    resetForm();
  }
 
  return (
    <form onSubmit={submit}>
      <input
        placeholder="Bill Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
 
      <input
        type="number"
        min="0"
        step="0.01"
        placeholder="Amount"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
      />
 
      <input
        type="number"
        min="1"
        max="31"
        placeholder="Due Day"
        value={dueDay}
        onChange={(event) => setDueDay(event.target.value)}
      />
 
      <select
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      >
        <option>Utilities</option>
        <option>Housing</option>
        <option>Insurance</option>
        <option>Subscriptions</option>
        <option>Loan</option>
        <option>Credit Card</option>
        <option>Medical</option>
        <option>Other</option>
      </select>
 
      <label>
        <input
          type="checkbox"
          checked={recurring}
          onChange={(event) => setRecurring(event.target.checked)}
        />
        Recurring monthly
      </label>
 
      <label>
        <input
          type="checkbox"
          checked={autoPay}
          onChange={(event) => setAutoPay(event.target.checked)}
        />
        Autopay
      </label>
 
      {editingBill && (
        <label>
          <input
            type="checkbox"
            checked={paid}
            onChange={(event) => setPaid(event.target.checked)}
          />
          Paid
        </label>
      )}
 
      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
 
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 12,
        }}
      >
        <button type="submit">
          {editingBill ? "Save Changes" : "Add Bill"}
        </button>
 
        {editingBill && onCancel && (
          <button
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
