import { ChangeEvent, useState } from "react";
import { Bill, BillCategory } from "../types/Bill";
import { useBills } from "../hooks/useBills";
import { formatCurrency } from "../utils/formatCurrency";

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

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0] ?? null;

    setFile(selectedFile);
    setHasScanned(false);
    setBills([]);
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

    const extractedBills: ExtractedBill[] = data.bills.map(
      (bill: Bill) => ({
        ...bill,
        confidence: bill.confidence ?? 96,
        selected: true,
      })
    );

    setBills(extractedBills);
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
      {file && !hasScanned && (
        <button
          type="button"
          onClick={handleScan}
          disabled={isScanning}
          className="w-full rounded-xl bg-slate-900 px-5 py-4 font-bold text-white shadow transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isScanning
            ? "🔎 Scanning Statement..."
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
                className="w-full rounded-xl bg-green-600 px-5 py-4 font-bold text-white shadow transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ✅ Add {selectedCount} Selected{" "}
                {selectedCount === 1 ? "Bill" : "Bills"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}