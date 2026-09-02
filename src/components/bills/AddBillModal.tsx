import { FormEvent, useEffect, useState } from "react";
import {
  Bill,
  BillFrequency,
} from "../../types/Bill"
import { BillCategory } from "../../types/Bill";
import Button from "../common/Button";
import { X } from "lucide-react"

interface AddBillModalProps {
  open: boolean;
  bill?: Bill | null;
  frequency: BillFrequency;
  onClose: () => void;
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


export default function AddBillModal({
  open,
  bill,
  onClose,
  onSave,
}: AddBillModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] =
    useState<BillCategory>("Other");
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] =
    useState<BillFrequency>("monthly");
  const [notes, setNotes] = useState("");

  useEffect(() => {
  if (bill) {
    setName(bill.name);
    setAmount(bill.amount.toString());
    setDueDate(bill.dueDate);
    setCategory(bill.category);
    setRecurring(bill.recurring);
    setFrequency(bill.frequency ?? "monthly");
    setNotes(bill.notes ?? "");
  } else {
    setFrequency("monthly");
    resetForm();
  }
}, [bill]);
    
  if (!open) {
    return null;
  }

  function resetForm() {
    setName("");
    setAmount("");
    setDueDate("");
    setCategory("Other");
    setRecurring(false);
    setFrequency("monthly");
    setNotes("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (!name.trim() || !dueDate || numericAmount <= 0) {
      return;
    }

    const now = new Date().toISOString();

    const newBill: Bill = {
    id: bill?.id ?? crypto.randomUUID(),
    name: name.trim(),
    amount: numericAmount,
    dueDate,
    category,
    recurring,
    frequency:
      recurring
        ? frequency
        : "once",
    autoPay: bill?.autoPay ?? false,
    paid: bill?.paid ?? false,
    notes: notes.trim() || undefined,
    createdAt: bill?.createdAt ?? now,
    updatedAt: now,
  };

    onSave(newBill);

    resetForm();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-3xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {bill ? "Edit Bill" : "Add Bill"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {bill
  ? "Update your bill details."
  : "Add a bill to your DebtBeGone!! plan."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {/* Bill Name */}
          <div>
            <label
              htmlFor="bill-name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Bill Name
            </label>

            <input
              id="bill-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Electric, Mortgage, Verizon..."
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Amount + Due Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <label
                htmlFor="bill-amount"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Amount
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  $
                </span>

                <input
                  id="bill-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value)
                  }
                  placeholder="0.00"
                  required
                  className="w-full rounded-xl border border-slate-200 py-3 pl-8 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="bill-due-date"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Due Date
              </label>

              <input
                id="bill-due-date"
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

          {/* Category */}
          <div>
            <label
              htmlFor="bill-category"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Category
            </label>

            <select
              id="bill-category"
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value as BillCategory
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Recurring */}
          <div className="rounded-2xl bg-slate-100 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(event) => {
                const checked = event.target.checked;
                setRecurring(checked);
                if (checked && !bill?.frequency) {
                  setFrequency("monthly");
                }
              }}
              className="mt-1 h-5 w-5"
            />

            <div>
              <div className="font-semibold text-slate-800">
                Recurring Bill
              </div>

              <p className="text-sm text-slate-500">
                Automatically treat this as a recurring bill.
              </p>
            </div>
            </label>

            {recurring && (
              <div>
              <label className="mb-1 block text-sm text-slate-700">
                Frequency
              </label>

              <select
                value={frequency}
                onChange={(event) =>
                  setFrequency(event.target.value as BillFrequency)
                }
                className="w-full rounded-xl border p-3"
              >
                <option value="once">
                  Once
                </option>
                <option value="weekly">
                  Weekly
                </option>
                <option value="biweekly">
                  Biweekly
                </option>
                <option value="semimonthly">
                  Semi-Monthly
                </option>
                <option value="monthly">
                  Monthly
                </option>
                <option value="quarterly">
                  Quarterly
                </option>
                <option value="semiannually">
                  Semi-Annually
                </option>
                <option value="annually">
                  Annually
                </option>
              </select>
            </div>
          )}
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="bill-notes"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Notes
            </label>

            <textarea
              id="bill-notes"
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder="Optional notes..."
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
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
              variant="primary"
              className="flex-1"
            >
              {bill ? "Save Changes" : "Save Bill"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
