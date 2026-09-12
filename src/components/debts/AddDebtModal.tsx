import { 
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  getFundingAccounts,
} from "../../utils/fundingAccountsStorage";
import type {
  FundingAccount,
} from "../../types/FundingAccount";
import { X } from "lucide-react";
import ActivityHistory from "../common/ActivityHistory";
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
  const [promoInterestRate, setPromoInterestRate] = useState("");
  const [promoEndDate, setPromoEndDate] = useState("");
  const [promoDeferredInterest, setPromoDeferredInterest] = useState(false);
  const [minimumPayment, setMinimumPayment] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [notes, setNotes] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [fundingAccounts] =
    useState<FundingAccount[]>(
      () => getFundingAccounts()
  );
const [
  fundingAccountId,
  setFundingAccountId,
] = useState("");

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
    setPromoInterestRate(
      prefill?.promoInterestRate !== undefined
        ? String(prefill.promoInterestRate)
        : ""
    );
    setPromoEndDate(prefill?.promoEndDate ?? ""
    );
    setPromoDeferredInterest(prefill?.promoDeferredInterest ?? false
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
    setFundingAccountId(
      prefill.fundingAccountId ?? ""
    );
  }
}, [open, prefill]);

  if (!open) return null;

  function resetForm() {
    setName("");
    setType("Credit Card");
    setBalance("");
    setOriginalBalance("");
    setInterestRate("");
    setPromoInterestRate("");
    setPromoEndDate("");
    setPromoDeferredInterest(false);
    setStatementDate("");
    setMinimumPayment("");
    setDueDate("");
    setCreditLimit("");
    setNotes("");
    setFundingAccountId("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const now = new Date().toISOString();

    const debt: Debt = {
  id: prefill?.id ?? crypto.randomUUID(),
  name: name.trim(),
  fundingAccountId: fundingAccountId || undefined,
  type,
  balance: Number(statementBalance),
  originalBalance: Number(originalBalance),
  statementDate:
    statementDate || undefined,
  statementBalance:
    statementBalance
      ? Number(statementBalance)
      : undefined,
  interestRate: Number(interestRate),
  minimumPayment: Number(minimumPayment),
  dueDate,
  creditLimit: creditLimit
    ? Number(creditLimit)
    : undefined,
  promoInterestRate:
      promoInterestRate !== ""
        ? Number(promoInterestRate)
        : undefined,
  promoEndDate: promoEndDate || undefined,
  promoDeferredInterest:
      promoEndDate
      ? promoDeferredInterest
      : undefined,

  notes: notes.trim() || undefined,

  activityHistory: (() => {
    const history = [
      ...(prefill?.activityHistory ?? []),
    ];

    const oldBalance =
      prefill?.balance;

    const newBalance =
      Number(statementBalance);

    if (
      prefill?.id &&
      oldBalance !== undefined &&
      oldBalance !== newBalance
    ) {
      history.push({
        id: crypto.randomUUID(),
        date: now,
        action: "Balance Updated",
        details:
          `$${oldBalance.toFixed(2)} → $${newBalance.toFixed(2)}`,
      });
    }

    const oldStatementBalance =
    prefill?.statementBalance;

    const newStatementBalance =
      statementBalance
        ? Number(statementBalance)
        : undefined;

    if (
      prefill?.id &&
      oldStatementBalance !== undefined &&
      newStatementBalance !== undefined &&
      oldStatementBalance !== newStatementBalance
    ) {
      history.push({
        id: crypto.randomUUID(),
        date: now,
        action: "Statement Balance Updated",
        details:
          `$${oldStatementBalance.toFixed(2)} → $${newStatementBalance.toFixed(2)}`,
      });
    }

    const oldAPR =
      prefill?.interestRate;

    const newAPR =
      Number(interestRate);

    if (
      prefill?.id &&
      oldAPR !== undefined &&
      oldAPR !== newAPR
    ) {
      history.push({
        id: crypto.randomUUID(),
        date: now,
        action: "APR Updated",
        details:
          `${oldAPR.toFixed(2)}% → ${newAPR.toFixed(2)}%`,
      });
    }

    const oldCreditLimit =
    prefill?.creditLimit;

  const newCreditLimit =
    creditLimit
      ? Number(creditLimit)
      : undefined;

  if (
    prefill?.id &&
    oldCreditLimit !== undefined &&
    newCreditLimit !== undefined &&
    oldCreditLimit !== newCreditLimit
  ) {
    history.push({
      id: crypto.randomUUID(),
      date: now,
      action: "Credit Limit Updated",
      details:
        `$${oldCreditLimit.toFixed(2)} → $${newCreditLimit.toFixed(2)}`,
    });
  }

  const oldPromoAPR =
  prefill?.promoInterestRate;

  const newPromoAPR =
    promoInterestRate !== ""
      ? Number(promoInterestRate)
      : undefined;

  if (
    prefill?.id &&
    oldPromoAPR === undefined &&
    newPromoAPR !== undefined
  ) {
    history.push({
      id: crypto.randomUUID(),
      date: now,
      action: "Promotional Financing Added",
      details: [
        `APR: ${newPromoAPR.toFixed(2)}%`,
        promoEndDate
          ? `Ends: ${promoEndDate}`
          : undefined,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }

  const oldPromoEndDate =
  prefill?.promoEndDate;

  const newPromoEndDate =
    promoEndDate || undefined;

  if (
    prefill?.id &&
    oldPromoEndDate &&
    newPromoEndDate &&
    oldPromoEndDate !== newPromoEndDate
  ) {
    history.push({
      id: crypto.randomUUID(),
      date: now,
      action: "Promotion End Date Updated",
      details:
        `${oldPromoEndDate} → ${newPromoEndDate}`,
    });
  }

  const oldDeferredInterest =
  prefill?.promoDeferredInterest;

  const newDeferredInterest =
    promoEndDate
      ? promoDeferredInterest
      : undefined;

  if (
    prefill?.id &&
    oldDeferredInterest !==
      newDeferredInterest
  ) {
    history.push({
      id: crypto.randomUUID(),
      date: now,
      action:
        newDeferredInterest
          ? "Deferred Interest Enabled"
          : "Deferred Interest Disabled",
    });
  }

    return history;
  })(),

createdAt: prefill?.createdAt ?? now,
updatedAt: now,
};

    onSave(debt);

    resetForm();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center">
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

          <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Paid From
          </label>

          <select
            value={fundingAccountId}
            onChange={(event) =>
              setFundingAccountId(
                event.target.value
              )
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          >
            <option value="">
              Unassigned
            </option>

            {fundingAccounts.map(
              (account) => (
                <option
                  key={account.id}
                  value={account.id}
                >
                  {account.name}
                </option>
              )
            )}
          </select>
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

          {/* Statement Balance + Statement Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <label
                htmlFor="balance"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Statement Balance
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  $
                </span>

                <input
                  id="balance"
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
                value={statementDate}
                onChange={(event) =>
                  setStatementDate(event.target.value)
                }
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>       

            {/* Original Balance + APR */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Original Balance */}
              <div>
                <label
                  htmlFor="debt-amount"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Original Balance
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    $
                  </span>

                  <input
                    id="debt-amount"
                    type="number"
                    step="0.01"
                    value={originalBalance}
                    onChange={(event) =>
                      setOriginalBalance(event.target.value)
                    }
                    placeholder="0.00"
                    required
                    className="w-full rounded-xl border border-slate-200 py-3 pl-8 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* APR / Interest Rate */}
              <div>
                <label
                  htmlFor="interest-rate"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  APR / Interest Rate
                </label>

                <div className="relative">
                  <input
                    id="interest-rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={interestRate}
                    onChange={(event) =>
                      setInterestRate(event.target.value)
                    }
                    placeholder="0.00"
                    required
                    className="w-full rounded-xl border border-slate-200 py-3 pl-4 pr-10 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    %
                  </span>
                </div>
              </div>
            </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="debt-amount"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Credit Limit (optional)
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  $
                </span>

                <input
                  id="credit-limit"
                  type="number"
                  step="0.01"
                  value={creditLimit}
                  onChange={(event) =>
                    setCreditLimit(event.target.value)
                  }
                  placeholder="0.00"
                  required
                  className="w-full rounded-xl border border-slate-200 py-3 pl-8 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Notes
            </label>

            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        
          {/* Promotional Financing */}
          <div className="rounded-2xl bg-blue-50 p-4">
            <h3 className="font-semibold text-slate-800">
              Promotional Financing
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Complete this section when the debt has a temporary
              promotional interest rate.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="promo-interest-rate"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Promotional APR
                </label>

                <div className="relative">
                  <input
                    id="promo-interest-rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={promoInterestRate}
                    onChange={(event) =>
                      setPromoInterestRate(event.target.value)
                    }
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-4 pr-10 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="promo-end-date"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Promotion End Date
                </label>

                <input
                  id="promo-end-date"
                  type="date"
                  value={promoEndDate}
                  onChange={(event) =>
                    setPromoEndDate(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {promoEndDate && (
              <label className="mt-4 flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={promoDeferredInterest}
                  onChange={(event) =>
                    setPromoDeferredInterest(
                      event.target.checked
                    )
                  }
                  className="mt-1 h-5 w-5 shrink-0"
                />

                <div>
                  <div className="font-semibold text-slate-800">
                    Deferred-interest promotion
                  </div>

                  <p className="text-sm text-slate-500">
                    Interest may be charged retroactively if the balance
                    is not paid before the promotion ends.
                  </p>
                </div>
              </label>
            )}
          </div>

          {/* Activity History */}
          <div className="self-start rounded-2xl border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() =>
                setShowHistory((current) => !current)
              }
              className="flex w-full items-center justify-between p-4 font-semibold"
              aria-expanded={showHistory}
            >
              <span>Activity History</span>

              <span aria-hidden="true">
                {showHistory ? "▲" : "▼"}
              </span>
            </button>

            {showHistory && (
              <div className="border-t p-4">
                <ActivityHistory
                  items={prefill?.activityHistory}
                />
              </div>
            )}
          </div>

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