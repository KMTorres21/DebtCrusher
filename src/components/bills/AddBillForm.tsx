import { useState } from "react";
import { Bill, BillCategory } from "../../types/Bill";

interface Props {
  onSave: (bill: Bill) => void;
}

const categories: BillCategory[] = [
  "Housing",
  "Utilities",
  "Insurance",
  "Phone",
  "Internet",
  "Credit Card",
  "Loan",
  "Subscription",
  "Medical",
  "Transportation",
  "Other",
];

export default function BillForm({ onSave }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState<BillCategory>("Other");
  const [recurring, setRecurring] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !amount || !dueDate) return;

    const now = new Date().toISOString();

    const bill: Bill = {
      id: crypto.randomUUID(),
      name,
      amount: parseFloat(amount),
      dueDate,
      category,
      recurring,
      paid: false,
      createdAt: now,
      updatedAt: now,
    };

    onSave(bill);

    setName("");
    setAmount("");
    setDueDate("");
    setCategory("Other");
    setRecurring(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <input
        type="text"
        placeholder="Bill Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border rounded-lg p-3"
        required
      />

      <input
        type="number"
        step="0.01"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full border rounded-lg p-3"
        required
      />

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full border rounded-lg p-3"
        required
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as BillCategory)}
        className="w-full border rounded-lg p-3"
      >
        {categories.map((cat) => (
          <option key={cat}>{cat}</option>
        ))}
      </select>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={recurring}
          onChange={(e) => setRecurring(e.target.checked)}
        />
        Recurring Monthly Bill
      </label>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 font-semibold"
      >
        Save Bill
      </button>

    </form>
  );
}