import { useMemo, useState, } from "react";
import { getFundingAccounts } from "../utils/fundingAccountsStorage";
import { usePaydayStrategySettings } from "../hooks/usePaydayStrategySettings";
import PageContainer from "../components/common/PageContainer";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import StatCard from "../components/common/StatCard";
import { useBills } from "../hooks/useBills";
import { useIncome } from "../hooks/useIncome";
import { useDebts } from "../hooks/useDebts";
import type { FundingAccount } from "../types/FundingAccount";

import {
  buildAllPaydayPlans,
  PaydayPlan,
} from "../utils/paydayStrategy";

import { formatCurrency } from "../utils/formatCurrency";

function formatDisplayDate(
  dateString: string
): string {
  const date = new Date(
    `${dateString}T12:00:00`
  );

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function parseDate(
  dateString: string
): Date {
  return new Date(
    `${dateString}T12:00:00`
  );
}

function normalizeObligationName(
  name: string
): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function createObligationOccurrenceKey(
  name: string,
  amount: number,
  dueDate: string
): string {
  const normalizedName =
    normalizeObligationName(name);

  const normalizedAmount =
    Math.round(amount * 100);

  return [
    normalizedName,
    normalizedAmount,
    dueDate,
  ].join("|");
}

function PaydayCard({
  plan,
  fundingAccounts,
}: {
  plan: PaydayPlan;
  fundingAccounts: FundingAccount[]
}) {
  const receivingAccount =
  fundingAccounts.find(
    (account) =>
      account.id ===
      plan.income.fundingAccountId
  ); 
  const uniqueBillItems =
    Array.from(
      plan.bills.reduce(
        (itemsByOccurrence, item) => {
          const key =
            createObligationOccurrenceKey(
              item.bill.name,
              item.bill.amount,
              item.dueDate
            );

          const existingItem =
            itemsByOccurrence.get(key);

          if (!existingItem) {
            itemsByOccurrence.set(
              key,
              item
            );

            return itemsByOccurrence;
          }

          const existingIsScan =
            existingItem.bill.id.startsWith(
              "scan-"
            );

          const currentIsScan =
            item.bill.id.startsWith(
              "scan-"
            );

          if (
            existingIsScan &&
            !currentIsScan
          ) {
            itemsByOccurrence.set(
              key,
              item
            );
          }

          return itemsByOccurrence;
        },
        new Map<
          string,
          PaydayPlan["bills"][number]
        >()
      ).values()
    );

    const fundingGroups =
    Array.from(
      uniqueBillItems.reduce(
        (groups, item) => {

          const accountId =
            item.bill.fundingAccountId ??
            "unassigned";     

          const account =
            fundingAccounts.find(
              (fundingAccount) =>
                fundingAccount.id ===
                accountId
            );         

          const accountName =
            account?.name ??
            "Unassigned";

          const existingGroup = 
            groups.get(accountId);

          if (existingGroup) {
            existingGroup.items.push(
              item
            );

            existingGroup.total +=
              item.allocatedAmount;

            return groups;
          }

          groups.set(accountId, {
            accountId,
            accountName,
            total:
              item.allocatedAmount,
            items: [item],
          });

          return groups;
        },
        new Map()
      ).values()
    );  

          const recommendedTransfers =
            fundingGroups
              .map((group) => {
                const account =
                  fundingAccounts.find(
                    (fundingAccount) =>
                      fundingAccount.id ===
                      group.accountId
                  );
          const currentBalance =
            account?.currentBalance ?? 0;
          const minimumBalance =
            account?.minimumBalance ?? 0;
          const projectedBalance =
            currentBalance -
            group.total;
          const reserveDifference =
            projectedBalance -
            minimumBalance;
          const availableToday =
            Math.max(
              0,
              currentBalance -
                minimumBalance
            );
          const futureIncome =
            plan.income.fundingAccountId ===
            group.accountId
              ? plan.amount
              : 0;
          const fundingCapacity =
            availableToday +
            futureIncome;
          const transferNeeded =
            Math.max(
              0,
              group.total -
              fundingCapacity
            ); 

          return {
            accountId:
              group.accountId,
            accountName:
              group.accountName,
            transferNeeded,
          };
        })
        .filter(
          (group) =>
            group.transferNeeded > 0
        );

    const totalTransfersNeeded =
      recommendedTransfers.reduce(
        (sum, item) =>
          sum +
          item.transferNeeded,
        0
      );    

  const uniqueTotalBills =
    uniqueBillItems.reduce(
      (total, item) =>
        total +
        item.allocatedAmount,
      0
    );

  const adjustedRemaining =
    plan.amount -
    uniqueTotalBills;

  const isPositive =
    adjustedRemaining >= 0;

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Payday
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {formatDisplayDate(
              plan.payday
            )}
          </h2>

          <p className="mt-1 text-sm font-semibold text-blue-600">
            Deposit to:{" "}
            {receivingAccount?.name ??
              "Unassigned Account"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-slate-500">
            Paycheck
          </p>

          <p className="text-xl font-bold text-green-600">
            {formatCurrency(
              plan.amount
            )}
          </p>
        </div>
      </div>

      <div className="mt-5">
        {recommendedTransfers.length >
          0 && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h4 className="text-sm font-bold uppercase tracking-wide text-blue-700">
              Recommended Transfers
            </h4>

            <div className="mt-3 space-y-2">
              {recommendedTransfers.map(
                (transfer) => (
                  <div
                    key={transfer.accountId}
                    className="flex items-center justify-between rounded-lg bg-white px-3 py-2"
                  >
                    <span className="font-medium text-slate-700">
                      ✅ Transfer to{" "}
                      {transfer.accountName}
                    </span>

                    <span className="font-bold text-blue-600">
                      {formatCurrency(
                        transfer.transferNeeded
                      )}
                    </span>
                  </div>
                )
              )}
            </div>

            <div className="mt-3 border-t border-blue-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">
                  Total Transfers Needed
                </span>

                <span className="font-bold text-blue-700">
                  {formatCurrency(
                    totalTransfersNeeded
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

      <h4 className="mt-4 text-sm font-bold uppercase tracking-wide text-slate-500">
        Funding Details
      </h4>

      <div className="mt-3 rounded-xl bg-slate-50 p-4">
        <div className="space-y-2">
          {fundingGroups.map((group) => (
            <div
              key={`summary-${group.accountId}`}
              className="flex items-center justify-between"
            >
              <span
                className={`font-medium ${
                  group.accountId ===
                  "unassigned"
                    ? "text-amber-600"
                    : "text-slate-700"
                }`}
              >
                {group.accountName}
              </span>

              <span className="font-bold text-blue-600">
                {formatCurrency(group.total)}
              </span>
            </div>
          ))}
        </div>
      </div>      

        {uniqueBillItems.length === 0 ? (
          <div className="mt-3 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">
              No bills need funding from this paycheck.
            </p>
          </div>
 ) : (
  <div className="mt-3 space-y-4">
    {fundingGroups.map((group) => (
      <div
        key={group.accountId}
        className="rounded-xl border border-slate-200 p-4"
      >
        <div className="flex items-center justify-between">
          <h4
            className={`font-bold ${
              group.accountId === "unassigned"
                ? "text-amber-600"
                : "text-slate-900"
            }`}
          >
            {group.accountName}
          </h4>

{(() => {
  const account =
    fundingAccounts.find(
      (fundingAccount) =>
        fundingAccount.id ===
        group.accountId
    );

  if (!account) {
    return null;
  }

  const currentBalance =
    account.currentBalance ?? 0;
  const minimumBalance =
    account.minimumBalance ?? 0;
  const availableToday =
    Math.max(
      0,
      currentBalance -
        minimumBalance
    );  
  const futureIncome =
    plan.income.fundingAccountId ===
    group.accountId
      ? plan.amount
      : 0;
  const fundingCapacity =
      availableToday +
      futureIncome;
  const projectedBalance =
    currentBalance +
    futureIncome -
    group.total;
  const reserveDifference =
    projectedBalance -
    minimumBalance;
  const isAboveMinimum =
    reserveDifference >= -0.01;
  const transferNeeded =
    Math.max(
      0,
      group.total +
        minimumBalance -
        fundingCapacity
    );


  return (
    <div className="mt-1 text-xs">
      <div className="text-slate-500">
        Current:{" "}
        {formatCurrency(
          currentBalance
        )}
      </div>

      <div className="text-slate-500">
        Minimum:{" "}
        {formatCurrency(
          minimumBalance
        )}
      </div>

      <div className="text-slate-500">
        Obligations:{" "}
        {formatCurrency(
          group.total
        )}
      </div>

      <div className="text-slate-500">
        Available Today:{" "}
        {formatCurrency(
          availableToday
        )}
      </div>

      <div className="text-slate-500">
        Future Income:{" "}
        {formatCurrency(
          futureIncome
        )}
      </div>

      <div className="font-semibold text-blue-600">
        Funding Capacity:{" "}
        {formatCurrency(
          fundingCapacity
        )}
      </div>

      {transferNeeded > 0 && (
        <div className="font-semibold text-blue-600">
          Transfer Needed:{" "}
          {formatCurrency(
            transferNeeded
          )}
        </div>
      )}

      <div
        className={`font-semibold ${
          isAboveMinimum
            ? "text-green-600"
            : "text-red-600"
        }`}
      >
        Projected:{" "}
        {formatCurrency(
          projectedBalance
        )}
      </div>

      <div
        className={`mt-1 font-semibold ${
          isAboveMinimum
            ? "text-green-600"
            : "text-red-600"
        }`}
      >
        {isAboveMinimum
          ? "🟢 Above Minimum"
          : `🔴 Below Minimum by ${formatCurrency(
              Math.abs(
                reserveDifference
              )
            )}`}
      </div>
    </div>
  );
})()}      

          <span className="font-bold text-blue-600">
            {formatCurrency(group.total)}
          </span>
        </div>

        {(() => {
          const account =
            fundingAccounts.find(
              (fundingAccount) =>
                fundingAccount.id ===
                group.accountId
            );

          const currentBalance =
            account?.currentBalance ?? 0;

          const futureIncome =
            plan.income.fundingAccountId ===
            group.accountId
              ? plan.amount
              : 0;
          const projectedBalance =
            currentBalance +
            futureIncome -
            group.total;

          return (
            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Current Balance
                </span>

                <span className="font-semibold">
                  {formatCurrency(
                    currentBalance
                  )}
                </span>
              </div>

              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Funding Needed
                </span>

                <span className="font-semibold text-red-600">
                  {formatCurrency(
                    group.total
                  )}
                </span>
              </div>

              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Projected Balance
                </span>

                <span
                  className={`font-bold ${
                    projectedBalance >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(
                    projectedBalance
                  )}
                </span>
              </div>

              {projectedBalance < 0 && (
                <p className="mt-2 text-xs font-semibold text-red-600">
                  ⚠ Funding shortage detected.
                </p>
              )}
            </div>
          );
        })()}        

        <div className="mt-3 space-y-2">
          {group.items.map((
            item: (typeof group.items)[number],
            index: number
          ) => {
            const isFullyFunded =
              Math.abs(
                item.allocatedAmount -
                  item.bill.amount
              ) < 0.01;

            return (
              <div
                key={`${item.bill.id}-${item.dueDate}-${index}`}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    {item.bill.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    Due{" "}
                    {formatDisplayDate(
                      item.dueDate
                    )}
                  </p>

                  <p
                    className={`mt-1 text-xs font-semibold ${
                      isFullyFunded
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}
                  >
                    {isFullyFunded
                      ? "Fully Funded"
                      : "Partially Funded"}
                  </p>
                </div>

                <div className="ml-4 shrink-0 text-right">
                  <p className="font-bold text-slate-900">
                    {formatCurrency(
                      item.allocatedAmount
                    )}
                  </p>

                  {!isFullyFunded && (
                    <p className="text-xs text-slate-400">
                      of{" "}
                      {formatCurrency(
                        item.bill.amount
                      )}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 border-t border-slate-200 pt-3 text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Account Total
          </p>

          <p className="text-lg font-bold text-blue-600">
            {formatCurrency(group.total)}
          </p>
        </div>
      </div>
    ))}
  </div>
)}
</div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <StatCard
          title="Allocated"
          value={formatCurrency(
            uniqueTotalBills
          )}
          valueClassName="text-red-600"
        />

        <StatCard
          title="Remaining"
          value={formatCurrency(
            adjustedRemaining
          )}
          valueClassName={
            isPositive
              ? "text-green-600"
              : "text-red-600"
          }
        />
      </div>

      {plan.nextPayday && (
        <p className="mt-4 text-center text-xs text-slate-400">
          Next paycheck:{" "}
          {formatDisplayDate(
            plan.nextPayday
          )}
        </p>
      )}
    </Card>
  );
}

export default function PaydayStrategyPage() {
  const { bills } = useBills();
  const { income } = useIncome();
  const { debts } = useDebts();
  const { settings } =
    usePaydayStrategySettings();
  const fundingAccounts = useMemo(
    () => getFundingAccounts(),
    []
    );
  const [
    showPastPaydays,
    setShowPastPaydays,
  ] = useState(false);

  const paydayPlans = useMemo(
    () =>
      buildAllPaydayPlans(
        income,
        bills,
        debts,
        settings.protectedPaycheckAmount
      ),
    [
      income,
      bills,
      debts,
      settings.protectedPaycheckAmount,
    ]
  );

  const today = new Date();

  today.setHours(
    12,
    0,
    0,
    0
  );

  const pastPaydayPlans =
    paydayPlans
      .filter(
        (plan) =>
          parseDate(plan.payday) <
          today
      )
      .sort(
        (a, b) =>
          parseDate(b.payday).getTime() -
          parseDate(a.payday).getTime()
      );

  const upcomingPaydayPlans =
    paydayPlans
      .filter(
        (plan) =>
          parseDate(plan.payday) >=
          today
      )
      .sort(
        (a, b) =>
          parseDate(a.payday).getTime() -
          parseDate(b.payday).getTime()
      );

  const nextPaydayPlan =
    upcomingPaydayPlans[0];

  const laterPaydayPlans =
    upcomingPaydayPlans.slice(1);

const summary = useMemo(() => {
  const summaryToday =
    new Date();

  summaryToday.setHours(
    12,
    0,
    0,
    0
  );

  const monthStart =
    new Date(
      summaryToday.getFullYear(),
      summaryToday.getMonth(),
      1,
      12,
      0,
      0,
      0
    );

  const nextMonthStart =
    new Date(
      summaryToday.getFullYear(),
      summaryToday.getMonth() + 1,
      1,
      12,
      0,
      0,
      0
    );

  const monthlyPlans =
    paydayPlans.filter(
      (plan) => {
        const payday =
          parseDate(
            plan.payday
          );

        return (
          payday >= monthStart &&
          payday < nextMonthStart
        );
      }
    );

  const totalUpcomingIncome =
    monthlyPlans.reduce(
      (sum, plan) =>
        sum + plan.amount,
      0
    );

  const monthlyObligations =
    new Map<string, number>();

  for (
    const plan of paydayPlans
  ) {
    for (
      const item of plan.bills
    ) {
      const dueDate =
        parseDate(
          item.dueDate
        );

      if (
        dueDate >= monthStart &&
        dueDate < nextMonthStart
      ) {
        const key =
          createObligationOccurrenceKey(
            item.bill.name,
            item.bill.amount,
            item.dueDate
          );

        if (
          !monthlyObligations.has(
            key
          )
        ) {
          monthlyObligations.set(
            key,
            item.bill.amount
          );
        }
      }
    }
  }

  const totalUpcomingBills =
    Array.from(
      monthlyObligations.values()
    ).reduce(
      (sum, amount) =>
        sum + amount,
      0
    );

  return {
    totalUpcomingIncome,
    totalUpcomingBills,
    projectedRemaining:
      totalUpcomingIncome -
      totalUpcomingBills,
  };
}, [paydayPlans]);

  return (
    <PageContainer>
      <PageHeader
        title="Payday Strategy"
        subtitle="Plan which bills each paycheck should fund."
      />

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Income This Month"
          value={formatCurrency(
            summary.totalUpcomingIncome
          )}
          valueClassName="text-green-600"
        />

        <StatCard
          title="Obligations This Month"
          value={formatCurrency(
            summary.totalUpcomingBills
          )}
          valueClassName="text-red-600"
        />
      </div>

      <Card>
        <p className="text-sm font-semibold text-slate-500">
          Projected Remaining
        </p>

        <p
          className={`mt-2 text-3xl font-bold ${
            summary.projectedRemaining >=
            0
              ? "text-blue-600"
              : "text-red-600"
          }`}
        >
          {formatCurrency(
            summary.projectedRemaining
          )}
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Projected income remaining after
          bills and debt payments due this
          month.
        </p>
      </Card>

      {paydayPlans.length === 0 ? (
        <Card>
          <div className="py-6 text-center">
            <div className="text-5xl">
              💰
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              No upcoming paychecks
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add an income source with
              a valid payday to build
              your strategy.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          {pastPaydayPlans.length >
            0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <button
                type="button"
                onClick={() =>
                  setShowPastPaydays(
                    (current) =>
                      !current
                  )
                }
                className="flex w-full items-center justify-between font-semibold text-slate-700"
                aria-expanded={
                  showPastPaydays
                }
              >
                <span>
                  Past Paydays (
                  {
                    pastPaydayPlans.length
                  }
                  )
                </span>

                <span aria-hidden="true">
                  {showPastPaydays
                    ? "▼"
                    : "▶"}
                </span>
              </button>
            </div>
          )}

          {showPastPaydays && (
            <div className="space-y-5">
              {pastPaydayPlans.map(
                (plan) => (
                  <PaydayCard
                    key={`${plan.income.id}-${plan.payday}`}
                    plan={plan}
                    fundingAccounts={fundingAccounts}
                  />
                )
              )}
            </div>
          )}

          {nextPaydayPlan && (
            <section>
              <div className="mb-3 rounded-xl border border-green-200 bg-green-50 p-3">
                <p className="text-sm font-bold text-green-800">
                  ⭐ Next Payday
                </p>

                <p className="mt-1 text-sm text-green-700">
                  {formatDisplayDate(
                    nextPaydayPlan.payday
                  )}
                </p>
              </div>

              <PaydayCard
                key={`${nextPaydayPlan.income.id}-${nextPaydayPlan.payday}`}
                plan={nextPaydayPlan}
                fundingAccounts={fundingAccounts}
              />
            </section>
          )}

          {laterPaydayPlans.length >
            0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                Upcoming Paydays
              </h2>

              <div className="space-y-5">
                {laterPaydayPlans.map(
                  (plan) => (
                    <PaydayCard
                      key={`${plan.income.id}-${plan.payday}`}
                      plan={plan}
                      fundingAccounts={fundingAccounts}
                    />
                  )
                )}
              </div>
            </section>
          )}

          {!nextPaydayPlan &&
            pastPaydayPlans.length >
              0 && (
              <Card>
                <p className="text-sm text-slate-600">
                  There are no upcoming
                  paydays. Expand Past
                  Paydays to review the
                  available history.
                </p>
              </Card>
            )}
        </div>
      )}
    </PageContainer>
  );
}