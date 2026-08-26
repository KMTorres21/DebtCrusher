import PageContainer from "../components/common/PageContainer";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";

import { usePaydayStrategySettings } from "../hooks/usePaydayStrategySettings";

export default function SettingsPage() {
  const {
    settings,
    setSettings,
    resetSettings,
  } = usePaydayStrategySettings();

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        subtitle="Customize how DebtCrusher plans and allocates your bills."
      />

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
                    billFundingMode: "large-bills",
                  })
                }
                className="mt-1"
              />

              <div>
                <p className="font-semibold text-slate-900">
                  Split Large Bills Automatically
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Split bills above the selected
                  percentage of available funding-cycle
                  income.
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
                    billFundingMode: "always-split",
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
                min="1"
                max="100"
                step="1"
                value={settings.largeBillThreshold}
                onChange={(event) => {
                  const value = Number(
                    event.target.value
                  );

                  if (Number.isNaN(value)) {
                    return;
                  }

                  setSettings({
                    largeBillThreshold: Math.min(
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
      </Card>

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
    </PageContainer>
  );
}