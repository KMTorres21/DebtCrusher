import { ChangeEvent, useState } from "react";
import { Bill } from "../types/Bill";
import { Debt } from "../types/Debt";
import { useDebts } from "../hooks/useDebts";
import { useBills } from "../hooks/useBills";
import { formatCurrency } from "../utils/formatCurrency";
import AddBillModal from "../components/bills/AddBillModal";
import AddDebtModal from "../components/debts/AddDebtModal";

type MatchStatus =
  | "new"
  | "possible"
  | "existing";

type MatchRecordType =
  | "bill"
  | "debt";

interface ExtractedBill extends Bill {
  confidence: number;
  selected: boolean;
  apr?: number;
  statementDate?: string;
  statementBalance?: number;
  currentBalance?: number;
  creditLimit?: number;
  matchStatus: MatchStatus;
  matchedRecordType?: MatchRecordType;
  matchedRecordId?: string;
  matchedRecordName?: string;
}

export default function StatementScannerPage() {
  const {
  bills: existingBills,
  addBill,
function normalizeName(
  value: string
): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function namesPossiblyMatch(
  first: string,
  second: string
): boolean {
  const a = normalizeName(first);
  const b = normalizeName(second);

  if (!a || !b) {
    return false;
  }

  if (a === b) {
    return true;
  }

  if (a.length < 4 || b.length < 4) {
    return false;
  }

  return (
    a.includes(b) ||
    b.includes(a)
  );
  }
  } = useBills();

const {
  debts: existingDebts,
  addDebt,
} = useDebts();
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [bills, setBills] = useState<ExtractedBill[]>([]);
  const [editingBill, setEditingBill] = useState<ExtractedBill | null>(null);
  const [debtPrefill, setDebtPrefill] = useState<Partial<Debt> | null>(null);
  const [convertingBillId, setConvertingBillId] = useState<string | null>(null);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0] ?? null;

    setFile(selectedFile);
  };

const handleScan = async () => {
  if (!file) return;

  setIsScanning(true);

  try {
    const formData = new FormData();
    formData.append("statement", file);

    const response = await fetch(
      "/api/statements/extract",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Statement scan failed.");
    }

    const data = await response.json();

    if (!data.ok) {
      throw new Error(
        data.message || "No bills were extracted."
      );
    }

 const extractedBills: ExtractedBill[] =
  data.bills.map(
    (
      bill: {
        name?: string | null;
        amount?: number | null;
        apr?: number | null;
        dueDate?: string | null;
        statementDate?: string | null;
        statementBalance?: number | null;
        currentBalance?: number | null;
        creditLimit?: number | null;
        category?: string | null;
const scannedName =
  bill.name ?? "";

const normalizedScannedName =
  normalizeName(scannedName);

const exactDebtMatch =
  existingDebts.find(
    (debt) =>
      normalizeName(debt.name) ===
      normalizedScannedName
  );

const exactBillMatch =
  existingBills.find(
    (existingBill) =>
      normalizeName(existingBill.name) ===
      normalizedScannedName
  );

const possibleDebtMatch =
  existingDebts.find(
    (debt) =>
      namesPossiblyMatch(
        scannedName,
        debt.name
      )
  );

const possibleBillMatch =
  existingBills.find(
    (existingBill) =>
      namesPossiblyMatch(
        scannedName,
        existingBill.name
      )
  );

const exactMatch =
  exactDebtMatch ??
  exactBillMatch;

const possibleMatch =
  possibleDebtMatch ??
  possibleBillMatch;

const matchedRecord =
  exactMatch ??
  possibleMatch;

const matchStatus: MatchStatus =
  exactMatch
    ? "existing"
    : possibleMatch
      ? "possible"
      : "new";

const matchedRecordType:
  MatchRecordType | undefined =
  matchedRecord
    ? existingDebts.some(
        (debt) =>
          debt.id ===
          matchedRecord.id
      )
      ? "debt"
      : "bill"
    : undefined;
        recurring?: boolean | null;
        paid?: boolean | null;
        autoPay?: boolean | null;
        notes?: string | null;
        confidence?: number | null;
      },
      index: number
    ) => {
      const validCategories = [
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
      ] as const;

      const category = validCategories.includes(
        bill.category as (typeof validCategories)[number]
      )
        ? (bill.category as Bill["category"])
        : "Other";

      return {
        id: `scan-${Date.now()}-${index}`,
        name: bill.name ?? "",
        amount:
          typeof bill.amount === "number"
            ? bill.amount
            : 0,
        apr: 
          typeof bill.apr === "number"
            ? bill.apr
            : undefined,
        statementDate: bill.statementDate ??
          undefined,
        statementBalance:
          typeof bill.statementBalance === "number"
            ? bill.statementBalance
            : undefined,
        currentBalance:
          typeof bill.currentBalance === "number"
            ? bill.currentBalance
            : undefined,
        dueDate: bill.dueDate ?? "",
        category,
        paid: bill.paid ?? false,
        recurring: bill.recurring ?? false,
        autoPay: bill.autoPay ?? false,
        creditLimit:
          typeof bill.creditLimit === "number"
            ? bill.creditLimit
            : undefined,
        notes: bill.notes ?? undefined,
        createdAt: new Date().toISOString(),
        confidence: bill.confidence ?? 0,
        selected: true,
      };
    }
  );

    setBills((current) => [
    ...current,
    ...extractedBills,
  ]);
  setHasScanned(true);

  } catch (error) {
    console.error("Statement scan error:", error);
    alert(
      error instanceof Error
        ? error.message
        : "Unable to scan statement."
    );
  } finally {
    setIsScanning(false);
  }
};
  const toggleBill = (id: string) => {
    setBills((current) =>
      current.map((bill) =>
        bill.id === id
          ? {
              ...bill,
              selected: !bill.selected,
            }
          : bill
      )
    );
  };

const handleEditBill = (bill:
  ExtractedBill) => {
    setEditingBill(bill);
  };

const handleAddDebt = (bill: ExtractedBill) => {
  const latestBalance =
    typeof bill.statementBalance === "number"
      ? bill.statementBalance
      : typeof bill.currentBalance === "number"
        ? bill.currentBalance
        : 0;
  setConvertingBillId(bill.id);

  setDebtPrefill({
    name: bill.name,
    type: "Credit Card",

    // Keep internal balance compatible with the debt model
    balance: latestBalance,

    // Statement information from scanner
    statementBalance:
      typeof bill.statementBalance === "number"
        ? bill.statementBalance
        : typeof bill.currentBalance === "number"
          ? bill.currentBalance
          : undefined,

    statementDate:
      bill.statementDate ?? undefined,

    // Initial value until manually corrected, if necessary
    originalBalance: latestBalance,

    creditLimit:
      typeof bill.creditLimit === "number"
        ? bill.creditLimit
        : undefined,

    interestRate:
      typeof bill.apr === "number"
        ? bill.apr
        : 0,

    minimumPayment: bill.amount,

    dueDate: bill.dueDate,

    notes: bill.notes ?? undefined,
  });
};
  const handleSaveEditBill = (updatedBill: Bill) => {
    setBills((current) =>
      current.map((bill) =>
        bill.id === updatedBill.id
          ? { ...bill,
              ...updatedBill,
              confidence: bill.confidence,
              selected: bill.selected,
            }
          : bill
      )
    );
    setEditingBill(null);
  };

  const handleCancelEditBill = () => {
    setEditingBill(null);
  };

  const addSelectedBills = () => {
    const selectedBills = bills.filter(
  (bill) =>
    bill.selected &&
    bill.name.trim() &&
    bill.amount > 0 &&
    bill.dueDate
);

    selectedBills.forEach((bill) => {
      const { confidence, selected, ...newBill } = bill;

      addBill(newBill);
    });

    setBills((current) =>
      current.filter((bill) => !bill.selected)
    );
  };

  const selectedCount = bills.filter(
    (bill) => bill.selected
  ).length;

  return (
    <>
{isScanning && (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
    <div className="mx-5 w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>

      <h2 className="mt-5 text-2xl font-bold text-slate-900">
        Scanning Statement...
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        DebtBeGone!! is analyzing your statement and looking for bills.
      </p>

      <p className="mt-4 text-xs text-slate-400">
        Please wait while the scan completes.
      </p>
    </div>
  </div>
)}      
      <div className="space-y-6 px-5 py-6 pb-32">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          AI Statement Scanner
        </h1>

        <p className="mt-1 text-slate-500">
          Upload a statement and let DebtBeGone!! find your bills.
        </p>
      </div>

      {/* Upload */}
      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="text-center">
          <div className="text-5xl">📄</div>

          <h2 className="mt-3 text-xl font-bold">
            Upload a Statement
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            PDF, image, or screenshot
          </p>

          <label className="mt-5 inline-flex cursor-pointer rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
            Choose Statement
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {file && (
            <div className="mt-4 rounded-xl bg-slate-100 p-3 text-sm">
              <span className="font-semibold">
                Selected:
              </span>{" "}
              {file.name}
            </div>
          )}
        </div>
      </div>

      {/* Scan */}
      {file && !isScanning && (
        <button
          type="button"
          onClick={handleScan}
          disabled={isScanning}
          className="w-full rounded-xl bg-slate-900 px-5 py-4 font-bold text-white shadow transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isScanning
            ? "🔎 Scanning Statement..."
            : bills.length > 0
              ? "🤖 Scan Another Statement"
              : "🤖 Scan Statement"}
        </button>
      )}

      {/* Results */}
      {hasScanned && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">
              Review Bills
            </h2>

            <p className="text-sm text-slate-500">
              Review the information before adding anything
              to DebtBeGone!!.
            </p>
          </div>

          {bills.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-center shadow">
              <div className="text-4xl">🔍</div>

              <h3 className="mt-3 font-bold">
                No bills found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try another statement.
              </p>
            </div>
          ) : (
            <>
              {bills.map((bill) => (
  <div
    key={bill.id}
    className={`rounded-2xl border-2 bg-white p-5 shadow ${
      bill.selected
        ? "border-blue-500"
        : "border-slate-200"
    }`}
  >
    <div className="flex items-start gap-4">
      <input
        type="checkbox"
        checked={bill.selected}
        onChange={() => toggleBill(bill.id)}
        className="mt-1 h-5 w-5"
      />

      <div className="min-w-0 flex-1">

        {/* Name, due date, payment amount */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold">
              {bill.name}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Due {bill.dueDate}
            </p>
          </div>

          <div className="text-right font-bold">
            {formatCurrency(bill.amount)}
          </div>
        </div>

        {/* Statement information */}
        <div className="mt-3 space-y-1 text-sm text-slate-500">
          {bill.statementDate && (
            <p>
              Statement Date: {bill.statementDate}
            </p>
          )}

          {typeof bill.statementBalance === "number" && (
            <p>
              Statement Balance:{" "}
              {formatCurrency(bill.statementBalance)}
            </p>
          )}

          {typeof bill.currentBalance === "number" && (
            <p>
              Current Balance:{" "}
              {formatCurrency(bill.currentBalance)}
            </p>
          )}

          {typeof bill.apr === "number" && (
            <p>
              APR: {bill.apr.toFixed(2)}%
            </p>
          )}
        </div>

        {/* Tags */}
{bill.matchStatus === "existing" && (
  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
    Existing {bill.matchedRecordType}
  </span>
)}

{bill.matchStatus === "possible" && (
  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
    Possible Match
  </span>
)}

{bill.matchStatus === "new" && (
  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
    New
  </span>
)}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
            {bill.category}
          </span>

          {bill.recurring && (
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              Recurring
            </span>
          )}

          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            {bill.confidence}% confidence
          </span>

          {typeof bill.apr === "number" && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {bill.apr.toFixed(2)}% APR
            </span>
          )}
        </div>

        {/* Edit */}
        <button
          type="button"
          onClick={() => handleEditBill(bill)}
          className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Edit Bill
        </button>

        {/* Convert credit card to debt */}
        {bill.category === "Credit Card" && (
          <button
            type="button"
            onClick={() => handleAddDebt(bill)}
            className="mt-2 w-full rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
          >
            Add as Debt
          </button>
        )}
      </div>
    </div>
  </div>
))}

              <button
                type="button"
                onClick={addSelectedBills}
       disabled={
  selectedCount === 0 ||
  bills.some(
    (bill) =>
      bill.selected &&
      (!bill.name.trim() ||
        bill.amount <= 0 ||
        !bill.dueDate)
  )
}
                className="w-full rounded-xl bg-green-600 px-5 py-4 font-bold text-white 
                  shadow transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ✅ Add {selectedCount} Selected{" "}
                {selectedCount === 1 ? "Bill" : "Bills"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
    <AddBillModal
      open={editingBill !== null}
      bill={editingBill}
      frequency={editingBill?.frequency ?? "monthly"}
      onClose={() => setEditingBill(null)}
      onSave={handleSaveEditBill}
    />
    <AddDebtModal
  open={debtPrefill !== null}
  prefill={debtPrefill ?? undefined}
  onClose={() => {
    setDebtPrefill(null);
    setConvertingBillId(null);
  }}
  onSave={(debt) => {
    addDebt(debt);

    setBills((current) => {
      const remainingBills = current.filter(
        (bill) => bill.id !== convertingBillId
      );

      if (remainingBills.length === 0) {
        setHasScanned(false);
        setFile(null);
      }

      return remainingBills;
    });

    setDebtPrefill(null);
    setConvertingBillId(null);
     }}
    />
  </>
  );
}