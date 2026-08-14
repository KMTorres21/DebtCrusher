import { FormEvent, useState } from "react";
import { X } from "lucide-react";

import { Income } from "../../types/Income";
import Button from "../common/Button";

interface AddIncomeModalProps {
  open: boolean;
  income? Income | null;
  onClose: () => void;
  onSave: (income: Income) => void;
}

const frequencies = [
  "weekly",
  "biweekly",
  "semimonthly",
  "monthly",
  "onetime",
] as const;

export default function AddIncomeModal({
  open,
  onClose,
  onSave,
}: AddIncomeModalProps) {
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] =
    useState<Income["frequency"]>("biweekly");
  const [nextPayDate, setNextPayDate] = useState("");
  const [notes, setNotes] = useState("");

  if (!open) return null;

  function resetForm() {
    setSource("");
    setAmount("");
    setFrequency("biweekly");
    setNextPayDate("");
    setNotes("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const now = new Date().toISOString();

    const income: Income = {
      id: crypto.randomUUID(),
      source: source.trim(),
      amount: Number(amount),
      frequency,
      nextPayDate,
      notes: notes.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    onSave(income);

    resetForm();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-3xl">

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold">
              Add Income
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add an income source.
            </p>
          </div>

          <button
            onClick={handleClose}
            className="rounded-full p-2 hover:bg-slate-100"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          <input
            type="text"
            placeholder="Employer or Income Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />

          <select
            value={frequency}
            onChange={(e) =>
              setFrequency(
                e.target.value as Income["frequency"]
              )
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          >
            {frequencies.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={nextPayDate}
            onChange={(e) =>
              setNextPayDate(e.target.value)
            }
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />

          <textarea
            rows={3}
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
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
              Save Income
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}