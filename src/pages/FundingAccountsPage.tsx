import { useEffect, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/common/Card";

import { FundingAccount } from "../types/FundingAccount";

import {
  getFundingAccounts,
  saveFundingAccounts,
} from "../utils/fundingAccountsStorage";

export default function FundingAccountsPage() {
  const [accounts, setAccounts] =
    useState<FundingAccount[]>([]);

  useEffect(() => {
    setAccounts(
      getFundingAccounts()
    );
  }, []);

  function handleAddAccount() {
    const name =
      window.prompt(
        "Funding Account Name"
      );

    if (!name) {
      return;
    }

    const now =
      new Date().toISOString();

    const account: FundingAccount = {
      id: crypto.randomUUID(),
      name,
      type: "Checking",
      createdAt: now,
      updatedAt: now,
    };

    const updated = [
      ...accounts,
      account,
    ];

    setAccounts(updated);
    saveFundingAccounts(updated);
  }

  function handleDeleteAccount(
    id: string
  ) {
    const updated =
      accounts.filter(
        (account) =>
          account.id !== id
      );

    setAccounts(updated);
    saveFundingAccounts(updated);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Funding Accounts"
        subtitle="Manage accounts used to fund bills, debts, and income deposits"
      />

      <button
        onClick={handleAddAccount}
        className="mb-4 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"
      >
        Add Funding Account
      </button>

      <div className="space-y-4">
        {accounts.map(
          (account) => (
            <Card key={account.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {account.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {account.type}
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleDeleteAccount(
                      account.id
                    )
                  }
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>
            </Card>
          )
        )}
      </div>
    </PageContainer>
  );
}