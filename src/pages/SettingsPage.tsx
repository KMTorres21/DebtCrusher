import {
  ChangeEvent,
  useRef,
  useState,
} from "react";

import {
  DebtCrusherBackup,
  downloadBackup,
  parseBackup,
  restoreBackup,
} from "../utils/backup";

export default function SettingsPage() {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [pendingBackup, setPendingBackup] =
    useState<DebtCrusherBackup | null>(null);

  const [fileName, setFileName] =
    useState("");

  const [error, setError] =
    useState("");

  function handleExport() {
    downloadBackup();
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setPendingBackup(null);
    setFileName(file.name);

    try {
      const contents = await file.text();

      const backup = parseBackup(contents);

      setPendingBackup(backup);
    } catch (err) {
      setFileName("");

      setError(
        err instanceof Error
          ? err.message
          : "Unable to read this backup."
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleRestore() {
    if (!pendingBackup) {
      return;
    }

    const confirmed = window.confirm(
      "Restore this DebtCrusher backup?\n\n" +
        "Your current DebtCrusher data will be replaced with the data from this backup."
    );

    if (!confirmed) {
      return;
    }

    /*
     * Automatically create a safety backup
     * before replacing the current data.
     */
    downloadBackup();

    restoreBackup(pendingBackup);

    window.alert(
      "DebtCrusher has been restored successfully."
    );

    /*
     * The existing hooks loaded their values
     * into React state when the app started.
     *
     * Reloading causes useBills, useDebts,
     * useIncome, etc. to read the restored
     * localStorage values.
     */
    window.location.reload();
  }

  function cancelImport() {
    setPendingBackup(null);
    setFileName("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const backupDate = pendingBackup
    ? new Date(
        pendingBackup.exportedAt
      ).toLocaleString()
    : null;

  const recordGroups = pendingBackup
    ? Object.keys(pendingBackup.data).length
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Settings
        </h1>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          Data & Backup
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Export a complete backup of your
          DebtCrusher data or restore data from
          a previous backup.
        </p>

        <div className="mt-6 space-y-6">
          {/* EXPORT */}

          <div>
            <h3 className="font-semibold">
              Export DebtCrusher Backup
            </h3>

            <p className="mt-1 text-sm text-gray-600">
              Download your DebtCrusher data
              as a JSON backup file.
            </p>

            <button
              type="button"
              onClick={handleExport}
              className="mt-3 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Export Backup
            </button>
          </div>

          <hr className="border-gray-200" />

          {/* IMPORT */}

          <div>
            <h3 className="font-semibold">
              Import DebtCrusher Backup
            </h3>

            <p className="mt-1 text-sm text-gray-600">
              Select a backup previously
              exported from DebtCrusher.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="mt-3 block w-full text-sm"
            />

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="font-medium text-red-700">
                  Unable to import backup
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            {pendingBackup && (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h4 className="font-semibold text-amber-900">
                  Backup Ready to Restore
                </h4>

                <div className="mt-2 space-y-1 text-sm text-amber-900">
                  <p>
                    <strong>File:</strong>{" "}
                    {fileName}
                  </p>

                  <p>
                    <strong>
                      Backup created:
                    </strong>{" "}
                    {backupDate}
                  </p>

                  <p>
                    <strong>
                      Data groups:
                    </strong>{" "}
                    {recordGroups}
                  </p>
                </div>

                <p className="mt-4 text-sm font-medium text-amber-900">
                  Restoring this backup will
                  replace your current
                  DebtCrusher data.
                </p>

                <p className="mt-2 text-sm text-amber-800">
                  DebtCrusher will automatically
                  download a backup of your
                  current data before restoring
                  this file.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleRestore}
                    className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                  >
                    Restore Backup
                  </button>

                  <button
                    type="button"
                    onClick={cancelImport}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}