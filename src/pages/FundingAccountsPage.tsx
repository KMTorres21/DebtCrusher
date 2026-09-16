import { useEffect, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/common/Card";
import { formatCurrency } from "../utils/formatCurrency";
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

  const [newAccountName, setNewAccountName] =
  useState("");

  const [
  editingAccountId,
  setEditingAccountId,
] = useState<string | null>(
  null
);

const [
  editingName,
  setEditingName,
] = useState("");

const [
  editingBalance,
  setEditingBalance,
] = useState("");


const [
  editingMinimumBalance,
  setEditingMinimumBalance,
] = useState("");

  const [
    currentBalance,
    setCurrentBalance
  ] = useState("");

  const [
    minimumBalance,
    setMinimumBalance, 
  ] = useState("")

  function handleAddAccount() {
    if (
      !newAccountName.trim()
    ) {
      return;
    }

    const name =
      newAccountName.trim();

    const now =
      new Date().toISOString();

    const account: FundingAccount = {
      id: crypto.randomUUID(),
      name,
      type: "Checking",

      currentBalance:
        currentBalance.trim()
          ? Number(currentBalance)
          : undefined,

      createdAt: now,
      updatedAt: now,
    };

    const updated = [
      ...accounts,
      account,
    ];

console.log(
  "Creating Funding Account:",
  account
);    

    saveFundingAccounts(updated);
    setNewAccountName("");
    setCurrentBalance("");
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

  function handleStartEdit(
    account: FundingAccount
  ) {
    setEditingAccountId(
      account.id
    );

    setEditingName(
      account.name
    );

    setEditingBalance(
      account.currentBalance?.toString() ??
        ""
    );
    setEditingMinimumBalance(
    account.minimumBalance?.toString() ??
      ""
  );
  }

  function handleSaveEdit() {
    if (!editingAccountId) {
      return;
    }
    const updated =
      accounts.map(
        (account) =>
          account.id ===
          editingAccountId
            ? {
                ...account,
                name:
                  editingName.trim(),
                currentBalance:
                  editingBalance.trim()
                    ? Number(
                        editingBalance
                      )
                    : undefined,
                minimumBalance:
                  editingMinimumBalance.trim()
                    ? Number(
                        editingMinimumBalance
                      )
                    : undefined,
                updatedAt:
                  new Date().toISOString(),
              }
            : account
      );
    setAccounts(updated);
    saveFundingAccounts(
      updated
    );
    setEditingAccountId(
      null
    );
    setEditingName("");
    setEditingBalance("");
    setEditingMinimumBalance("");
    setNewAccountName("");
    setCurrentBalance("");
    setMinimumBalance("");
  }


  return (
    <PageContainer>
      <PageHeader
        title="Funding Accounts"
        subtitle="Manage accounts used to fund bills, debts, and income deposits"
      />

      <input
      value={newAccountName}
      onChange={(event) =>
        setNewAccountName(
          event.target.value
        )
      }
  placeholder="Funding Account Name"
  className="mb-3 w-full rounded-xl border border-slate-300 px-3 py-2"
/>

      <input
        type="number"
        step="0.01"
        value={currentBalance}
        onChange={(event) =>
          setCurrentBalance(
            event.target.value
          )
        }
        placeholder="Current Balance"
        className="mb-3 w-full rounded-xl border border-slate-300 px-3 py-2"
      />
          <input
            type="number"
            min="0"
            step="0.01"
            value={editingMinimumBalance}
            onChange={(event) =>
              setEditingMinimumBalance(
                event.target.value
              )
            }
            placeholder="Minimum Balance"
            className="mb-3 w-full rounded-xl border border-slate-300 px-3 py-2"
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
                  {editingAccountId ===
                  account.id ? (
                    <>
                      <input
                        value={editingName}
                        onChange={(event) =>
                          setEditingName(
                            event.target.value
                          )
                        }
                        className="mb-2 w-full rounded border px-2 py-1"
                      />

                      <input
                        type="number"
                        step="0.01"
                        value={editingBalance}
                        onChange={(event) =>
                          setEditingBalance(
                            event.target.value
                          )
                        }
                        placeholder="Current Balance"
                        className="w-full rounded border px-2 py-1"
                      />

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingMinimumBalance}
                        onChange={(event) =>
                          setEditingMinimumBalance(
                            event.target.value
                          )
                        }
                        placeholder="Minimum Balance"
                        className="mt-2 w-full rounded border px-2 py-1"
                      />
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">
                        {account.name}
                      </p>

                      {typeof
                        account.currentBalance ===
                        "number" && (
                        <p className="text-sm text-green-600">
                          Balance:{" "}
                          {typeof account.minimumBalance ===
                            "number" && (
                            <p className="text-sm text-blue-600">
                              Minimum:{" "}
                              {formatCurrency(
                                account.minimumBalance
                              )}
                            </p>
                          )}
                          {formatCurrency(
                            account.currentBalance
                          )}
                        </p>
                      )}

                      <p className="text-sm text-slate-500">
                        {account.type}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  {editingAccountId ===
                  account.id ? (
                    <button
                      onClick={
                        handleSaveEdit
                      }
                      className="text-blue-600"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleStartEdit(
                          account
                        )
                      }
                      className="text-blue-600"
                    >
                      Edit
                    </button>
                  )}

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
              </div>
            </Card>
          )
        )}
      </div>
    </PageContainer>
  );
}