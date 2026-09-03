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
  const [statementDate, setStatementDate] = useState("");
  const [balance, setBalance] = useState("");
  const [originalBalance, setOriginalBalance] = useState("");
  const [statementBalance, setStatementBalance] = useState("");
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
    setStatementDate(prefill?.statementDate ?? ""

    );
    setStatementBalance(
      prefill?.statementBalance !== undefined
        ? String(prefill.statementBalance)
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
    setStatementDate("");
    setStatementBalance("");
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
          {/* Debt Name */}
          <div>
            <label
              htmlFor="debt-name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Debt Name
            </label>

            <input
              id="debt-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Mortgage, Car Loan..."
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition 
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value as DebtType)
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition 
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

          {/* Statement Balance + Statement Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <label
                htmlFor="statement-balance"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Statement Balance
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  $
                </span>

                <input
                  id="statement-balance"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={statementBalance}
                  onChange={(event) =>
                    setStatementBalance(event.target.value)
                  }
                  placeholder="0.00"
                  required
                  className="w-full rounded-xl border border-slate-200 py-3 pl-8 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="statement-date"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Statement Date
              </label>

              <input
                id="statement-date"
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(event.target.value)
                }
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>       

          {/* Interest Rate */}
          <input
            type="number"
            step="0.01"
            placeholder="Interest Rate (%)"
            value={interestRate}
            onChange={(e) =>
              setInterestRate(e.target.value)
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition 
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          />

          {/* Amount + Due Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <label
                htmlFor="debt-amount"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Minimum Payment
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  $
                </span>

                <input
                  id="debt-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={minimumPayment}
                  onChange={(event) =>
                    setMinimumPayment(event.target.value)
                  }
                  placeholder="0.00"
                  required
                  className="w-full rounded-xl border border-slate-200 py-3 pl-8 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="debt-due-date"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Due Date
              </label>

              <input
                id="debt-due-date"
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(event.target.value)
                }
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

          </div>

          <input
            type="number"
            placeholder="Credit Limit (optional)"
            value={creditLimit}
            onChange={(e) =>
              setCreditLimit(e.target.value)
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition 
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <textarea
            placeholder="Notes"
            rows={3}
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition 
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
              {prefill?.id ? "Save Changes" : "Save Debt"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}