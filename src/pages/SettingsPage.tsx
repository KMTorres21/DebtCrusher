import {
  ChangeEvent,
  useRef,
  useState,
} from "react";

import PageContainer from "../components/common/PageContainer";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import { useDisplaySettings } from "../hooks/useDisplaySettings";
import { usePaydayStrategySettings } from "../hooks/usePaydayStrategySettings";

import {
  DebtBeGoneBackup,
  downloadBackup,
  parseBackup,
  restoreBackup,
} from "../utils/backup";

export default function SettingsPage() {
  const {
    settings: displaySettings,
    setSettings: setDisplaySettings,
  } = useDisplaySettings();

  const {
    settings,
    setSettings,
    resetSettings,
  } = usePaydayStrategySettings();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [pendingBackup, setPendingBackup] =
    useState<DebtBeGoneBackup | null>(null);

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
      "Restore this DebtBeGone!! backup?\n\n" +
        "Your current DebtBeGone!! data will be replaced with the data from this backup."
    );

    if (!confirmed) {
      return;
    }

    // Safety backup before restore
    downloadBackup();

    restoreBackup(pendingBackup);

    window.alert(
      "DebtBeGone!! has been restored successfully."
    );

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
    ? Object.keys(
        pendingBackup.data
      ).length
    : 0;

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        subtitle="Customize DebtBeGone!! and manage your data."
      />

      {/* PAYDAY STRATEGY */}
      <Card>
        <h2 className="text-xl font-bold text-slate-900">
          Payday Strategy
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Control how bills are assigned to upcoming
          paychecks.
        </p>

        <div className="mt-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Bill Funding
          </h3>

          <div className="mt-3 space-y-3">

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
              <input
                type="radio"
                name="billFundingMode"
                value="together"
                checked={
                  settings.billFundingMode ===
                  "together"
                }
                onChange={() =>
                  setSettings({
                    billFundingMode: "together",
                  })
                }
                className="mt-1"
              />

              <div>
                <p className="font-semibold text-slate-900">
                  Keep Bills Together
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Assign each bill to one paycheck
                  whenever possible.
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
              <input
                type="radio"
                name="billFundingMode"
                value="large-bills"
                checked={
                  settings.billFundingMode ===
                  "large-bills"
                }
                onChange={() =>
                  setSettings({
                    billFundingMode:
                      "large-bills",
                  })
                }
                className="mt-1"
              />

              <div>
                <p className="font-semibold text-slate-900">
                  Split Large Bills Automatically
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Split large bills across eligible
                  paychecks based on the threshold
                  below.
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
              <input
                type="radio"
                name="billFundingMode"
                value="always-split"
                checked={
                  settings.billFundingMode ===
                  "always-split"
                }
                onChange={() =>
                  setSettings({
                    billFundingMode:
                      "always-split",
                  })
                }
                className="mt-1"
              />

              <div>
                <p className="font-semibold text-slate-900">
                  Always Split Bills
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Distribute every bill proportionally
                  across eligible paychecks.
                </p>
              </div>
            </label>

          </div>
        </div>

        {settings.billFundingMode ===
          "large-bills" && (
          <div className="mt-6">
            <label
              htmlFor="largeBillThreshold"
              className="text-sm font-bold uppercase tracking-wide text-slate-500"
            >
              Large Bill Threshold
            </label>

            <div className="mt-2 flex items-center gap-3">
              <input
                id="largeBillThreshold"
                type="number"
                min="0"
                max="100"
                step="1"
                value={
                  settings.largeBillThreshold
                }
                onChange={(event) => {
                  const value = Number(
                    event.target.value
                  );

                  if (Number.isNaN(value)) {
                    return;
                  }

                  setSettings({
                    largeBillThreshold:
                      Math.min(
                        100,
                        Math.max(1, value)
                      ),
                  });
                }}
                className="w-24 rounded-xl border border-slate-300 px-4 py-3 text-lg font-semibold text-slate-900 outline-none focus:border-slate-500"
              />

              <span className="text-lg font-semibold text-slate-600">
                %
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Bills above this percentage of eligible
              recurring income will be split across
              paychecks.
            </p>
          </div>
        )}

<div className="mt-6">
  <label
    htmlFor="protectedPaycheckAmount"
    className="text-sm font-bold uppercase tracking-wide text-slate-500"
  >
    Protected Paycheck Amount
  </label>

  <div className="mt-2 flex items-center gap-2">
    <span className="text-lg font-semibold text-slate-600">
      $
    </span>

    <input
      id="protectedPaycheckAmount"
      type="number"
      min="0"
      step="1"
      value={settings.protectedPaycheckAmount}
      onChange={(event) => {
        const value = Number(event.target.value);

        if (Number.isNaN(value)) {
          return;
        }

        setSettings({
          protectedPaycheckAmount:
            Math.max(0, value),
        });
      }}
      className="w-32 rounded-xl border border-slate-300 px-4 py-3 text-lg font-semibold text-slate-900 outline-none focus:border-slate-500"
    />
  </div>

  <p className="mt-2 text-sm text-slate-500">
    Keep this amount protected from bill and debt
    allocations on every paycheck.
  </p>
</div>
      </Card>

      {/* RESET PAYDAY STRATEGY */}
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Reset Payday Strategy
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Restore the default funding strategy and
              67% threshold.
            </p>
          </div>

          <button
            type="button"
            onClick={resetSettings}
            className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </Card>

      {/* DATA & BACKUP */}
      <Card>
        <h2 className="text-xl font-bold text-slate-900">
          Data & Backup
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Export a complete backup of your DebtBeGone!!
          data or restore a previous backup.
        </p>

        <div className="mt-6 space-y-6">

          {/* EXPORT */}
          <div>
            <h3 className="font-semibold text-slate-900">
              Export DebtBeGone!! Backup
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Download your DebtBeGone!! data as a JSON
              backup file.
            </p>

            <button
              type="button"
              onClick={handleExport}
              className="mt-3 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Export Backup
            </button>
          </div>

          <hr className="border-slate-200" />

          {/* IMPORT */}
          <div>
            <h3 className="font-semibold text-slate-900">
              Import DebtBeGone!! Backup
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Select a backup previously exported from
              DebtBeGone!!.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="mt-3 block w-full text-sm"
            />

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="font-semibold text-red-700">
                  Unable to import backup
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            {pendingBackup && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
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

                <p className="mt-4 text-sm font-semibold text-amber-900">
                  Restoring this backup will replace
                  your current DebtBeGone!! data.
                </p>

                <p className="mt-2 text-sm text-amber-800">
                  DebtBeGone!! will automatically export
                  a safety backup before restoring.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleRestore}
                    className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                  >
                    Restore Backup
                  </button>

                  <button
                    type="button"
                    onClick={cancelImport}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </Card>
    </PageContainer>
  );
}