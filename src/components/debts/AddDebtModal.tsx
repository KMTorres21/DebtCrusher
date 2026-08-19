import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";

import { Debt, DebtType } from "../../types/Debt";
import Button from "../common/Button";

interface AddDebtModalProps {
  open: boolean;
  debt?: Debt | null;
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
  debt,
  onClose,
  onSave,
}: AddDebtModalProps) {
  const [name, setName] = useState("");
  const [type, setType] =
    useState<DebtType>("Credit Card");
  const [balance, setBalance] = useState("");
  const [originalBalance, setOriginalBalance] =
    useState("");
  const [interestRate, setInterestRate] =
    useState("");
  const [minimumPayment, setMinimumPayment] =
    useState("");
  const [dueDate, setDueDate] = useState("");
  const [creditLimit, setCreditLimit] =
    useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;

    if (debt) {
      setName(debt.name);
      setType(debt.type);
      setBalance(String(debt.balance));
      setOriginalBalance(String(debt.originalBalance));
      setInterestRate(String(debt.interestRate));
      setMinimumPayment(String(debt.minimumPayment));
      setDueDate(debt.dueDate);
      setCreditLimit(
        debt.creditLimit !== undefined
          ? String(debt.creditLimit)
          : ""
      );
      setNotes(debt.notes ?? "");
    } else {
      resetForm();
    }
  }, [open, debt]);

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

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const now = new Date().toISOString();

    const savedDebt: Debt = {
      id: debt?.id ?? crypto.randomUUID(),
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
      createdAt: debt?.createdAt ?? now,
      updatedAt: now,
    };

    onSave(savedDebt);

    resetForm();
    onClose();
  }

  if (!open) return null;

  const isEditing = Boolean(debt);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-3xl">

        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold">
              {isEditing ? "Edit Debt" : "Add Debt"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? "Update your debt information."
                : "Add a debt to DebtCrusher."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 hover:bg-slate-100"
            aria-label="Close"
          >
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
            {debtTypes.map((debtType) => (
              <option
                key={debtType}
                value={debtType}
              >
                {debtType}
              </option>
            ))}
          </select>

          <input
            type="number"
            step="0.01"
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
            step="0.01"
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
            step="0.01"
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
            step="0.01"
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
              {isEditing
                ? "Save Changes"
                : "Save Debt"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}