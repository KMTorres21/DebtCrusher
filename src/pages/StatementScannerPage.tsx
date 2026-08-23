import { ChangeEvent, useState } from "react";
import { Bill } from "../types/Bill";
import { useBills } from "../hooks/useBills";
import { formatCurrency } from "../utils/formatCurrency";
import AddBillModal from "../components/bills/AddBillModal";

interface ExtractedBill extends Bill {
  confidence: number;
  selected: boolean;
}

export default function StatementScannerPage() {
  const { addBill } = useBills();

  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [bills, setBills] = useState<ExtractedBill[]>([]);
  const [editingBill, setEditingBill] = useState<ExtractedBill | null>(null);

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
      "http://localhost:3001/api/statements/extract",
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
    (bill: Bill & { confidence?: number }, index: number) => ({
      ...bill,
      id: bill.id || `scan-${Date.now()}-${index}`,
      confidence: bill.confidence ?? 0,
      selected: true,
    })
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
  const handleEditBill = (bill: ExtractedBill) => {
    setEditingBill(bill);
  };
  const handleSaveEditBill = (updatedBill: Bill) => {
    setBills((current) =>
      current.map((bill) =>
        bill.id === updatedBill.id
          ? { ...updatedBill, confidence: bill.confidence, selected: bill.selected }
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
      (bill) => bill.selected
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
        DebtCrusher is analyzing your statement and looking for bills.
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
          Upload a statement and let DebtCrusher find your bills.
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
              to DebtCrusher.
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
                      onChange={() =>
                        toggleBill(bill.id)
                      }
                      className="mt-1 h-5 w-5"
                    />

                    <div className="min-w-0 flex-1">
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

                          <button
                            type="button"
                            onClick={() => handleEditBill(bill)}
                            className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-2 
                              text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >Edit Bill
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addSelectedBills}
                disabled={selectedCount === 0}
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
      onClose={() => setEditingBill(null)}
      onSave={handleSaveEditBill}
    />
  </>
  );
}