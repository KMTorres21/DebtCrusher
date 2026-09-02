import { 
  FormEvent,
  useEffect,
  useState,
} from "react";

import { X } from "lucide-react";

import { Debt, DebtType } from "../../types/Debt";
import Button from "../common/Button";

interface AddDebtModalProps {
  open: boolean;
  prefill?: Partial<Debt>;
  onClose: () => void;
  onSave: (debt: Debt) => void;
}

const debtTypes: DebtType[] = [
  "Credit Card",
  "Auto Loan",
  "Personal Loan",
  "Student Loan",
  "Mortgage",
  "HELOC",
  "Medical",
  "Other",
];

export default function AddDebtModal({
  open,
  prefill,
  onClose,
  onSave,
}: AddDebtModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<DebtType>("Credit Card");
  const [balance, setBalance] = useState("");
  const [originalBalance, setOriginalBalance] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [minimumPayment, setMinimumPayment] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [notes, setNotes] = useState("");

useEffect(() => {
  if (!open) return;

  if (prefill) {
    setName(prefill.name ?? "");
    setType(prefill.type ?? "Credit Card");
    setBalance(
      prefill.balance !== undefined
        ? String(prefill.balance)
        : ""
    );
    setOriginalBalance(
      prefill.originalBalance !== undefined
        ? String(prefill.originalBalance)
        : ""
    );
    setInterestRate(
      prefill.interestRate !== undefined
        ? String(prefill.interestRate)
        : ""
    );
    setMinimumPayment(
      prefill.minimumPayment !== undefined
        ? String(prefill.minimumPayment)
        : ""
    );
    setDueDate(prefill.dueDate ?? "");
    setCreditLimit(
      prefill.creditLimit !== undefined
        ? String(prefill.creditLimit)
        : ""
    );
    setNotes(prefill.notes ?? "");
  }
}, [open, prefill]);

  if (!open) return null;

  function resetForm() {
    setName("");
    setType("Credit Card");
    setBalance("");
    setOriginalBalance("");
    setInterestRate("");
    setMinimumPayment("");
    setDueDate("");
    setCreditLimit("");
    setNotes("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const now = new Date().toISOString();

    const debt: Debt = {
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      balance: Number(balance),
      originalBalance: Number(originalBalance),
      interestRate: Number(interestRate),
      minimumPayment: Number(minimumPayment),
      dueDate,
      creditLimit: creditLimit
        ? Number(creditLimit)
        : undefined,
      notes: notes.trim() || undefined,
      createdAt: prefill?.createdAt ?? now,
      updatedAt: now,
    };

    onSave(debt);

    resetForm();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-3xl">

        <div className="flex items-center justify-between border-b px-6 py-5">
          <h2 className="text-2xl font-bold">
            {prefill?.id ? "Edit Debt" : "Add Debt"}
          </h2>

          <button onClick={handleClose}>
            <X />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          <input
            placeholder="Debt Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="w-full rounded-xl border p-3"
            required
          />

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value as DebtType)
            }
            className="w-full rounded-xl border p-3"
          >
            {debtTypes.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Current Balance"
            value={balance}
            onChange={(e) =>
              setBalance(e.target.value)
            }
            className="w-full rounded-xl border p-3"
            required
          />

          <input
            type="number"
            placeholder="Original Balance"
            value={originalBalance}
            onChange={(e) =>
              setOriginalBalance(e.target.value)
            }
            className="w-full rounded-xl border p-3"
            required
          />

          <input
            type="number"
            step="0.01"
            placeholder="Interest Rate (%)"
            value={interestRate}
            onChange={(e) =>
              setInterestRate(e.target.value)
            }
            className="w-full rounded-xl border p-3"
            required
          />

          <input
            type="number"
            placeholder="Minimum Payment"
            value={minimumPayment}
            onChange={(e) =>
              setMinimumPayment(e.target.value)
            }
            className="w-full rounded-xl border p-3"
            required
          />

          <input
            type="date"
            value={dueDate}
            onChange={(e) =>
              setDueDate(e.target.value)
            }
            className="w-full rounded-xl border p-3"
            required
          />

          <input
            type="number"
            placeholder="Credit Limit (optional)"
            value={creditLimit}
            onChange={(e) =>
              setCreditLimit(e.target.value)
            }
            className="w-full rounded-xl border p-3"
          />

          <textarea
            placeholder="Notes"
            rows={3}
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            className="w-full rounded-xl border p-3"
          />

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"

            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="flex-1"
            >
              {prefill?.id ? "SaveChanges" : "Savedebt"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}