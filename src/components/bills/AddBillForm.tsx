import { useState } from "react";
 
interface Props {
  onAdd: (bill: {
    name: string;
    amount: number;
    dueDay: number;
    category: string;
    paid: boolean;
    recurring: boolean;
    autoPay: boolean;
    notes: string;
  }) => void;
}
 
export default function AddBillForm({ onAdd }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [category, setCategory] = useState("Utilities");
 
  function submit(e: React.FormEvent) {
    e.preventDefault();
 
    if (!name || !amount || !dueDay) return;
 
    onAdd({
      name,
      amount: Number(amount),
      dueDay: Number(dueDay),
      category,
      paid: false,
      recurring: true,
      autoPay: false,
      notes: "",
    });
 
    setName("");
    setAmount("");
    setDueDay("");
    setCategory("Utilities");
  }
 
  return (
    <form onSubmit={submit}>
      <h2>Add Bill</h2>
 
      <input
        placeholder="Bill Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
 
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
 
      <input
        type="number"
        min="1"
        max="31"
        placeholder="Due Day"
        value={dueDay}
        onChange={(e) => setDueDay(e.target.value)}
      />
 
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
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
 
      <button type="submit">
        Add Bill
      </button>
    </form>
  );
}
