import PageContainer from "../components/layout/PageContainer";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/common/Card";
import { useBills } from "../hooks/useBills";
import { useDebts } from "../hooks/useDebts";
import { useIncome } from "../hooks/useIncome";

import {
  getFundingAccounts,
} from "../utils/fundingAccountsStorage";

import { formatCurrency } from "../utils/formatCurrency";

export default function CashFlowCenterPage() {
  const { bills } = useBills();

const { debts } = useDebts();

const { income } = useIncome();

const fundingAccounts =
    getFundingAccounts();

const unassignedBills =
  bills.filter(
    (bill) => !bill.fundingAccountId
  ).length;

const unassignedDebts =
  debts.filter(
    (debt) => !debt.fundingAccountId
  ).length;

const unassignedIncome =
  income.filter(
    (income) =>
      !income.fundingAccountId
  ).length;

  return (
    <PageContainer>
      <PageHeader
        title="Cash Flow Center"
        subtitle="Monthly cash flow by funding account"
      />

      {(
        unassignedBills > 0 ||
        unassignedDebts > 0 ||
        unassignedIncome > 0
        ) && (
        <Card className="mb-4 border-orange-200 bg-orange-50">
            <h2 className="font-semibold text-orange-900">
            ⚠ Unassigned Items
            </h2>

            <div className="mt-2 space-y-1 text-sm text-orange-800">
            <p>
                Bills: {unassignedBills}
            </p>

            <p>
                Debts: {unassignedDebts}
            </p>

            <p>
                Income Sources: {unassignedIncome}
            </p>
            </div>
        </Card>
        )}
      

      <div className="space-y-4">
        {fundingAccounts.map(
          (account) => {

            const incomeCount =
            income.filter(
                (income) =>
                income.fundingAccountId ===
                account.id
            ).length;

            const billCount =
            bills.filter(
                (bill) =>
                bill.fundingAccountId ===
                account.id
            ).length;

            const debtCount =
            debts.filter(
                (debt) =>
                debt.fundingAccountId ===
                account.id
            ).length;

            const incomeTotal =
              income
                .filter(
                  (income) =>
                    income.fundingAccountId ===
                    account.id
                )
                .reduce(
                  (sum, income) =>
                    sum + income.amount,
                  0
                );

            const billTotal =
              bills
                .filter(
                  (bill) =>
                    bill.fundingAccountId ===
                    account.id
                )
                .reduce(
                  (sum, bill) =>
                    sum + bill.amount,
                  0
                );

            const debtTotal =
              debts
                .filter(
                  (debt) =>
                    debt.fundingAccountId ===
                    account.id
                )
                .reduce(
                  (sum, debt) =>
                    sum +
                    debt.minimumPayment,
                  0
                );

            const netCashFlow =
              incomeTotal -
              billTotal -
              debtTotal;

            return (
              <Card key={account.id}>
                <div>
                <h2 className="text-lg font-bold">
                    {account.name}
                </h2>

                <p className="text-sm text-slate-500">
                    {account.type}
                </p>
                </div>

                <div className="mt-4 space-y-2">

                  <p>
                    Income Sources: {incomeCount}
                    </p>

                    <p>
                    Bills: {billCount}
                    </p>

                    <p>
                    Debts: {debtCount}
                    </p>

                  <p>
                    Income:{" "}
                    {
                      formatCurrency(
                        incomeTotal
                      )
                    }
                  </p>

                  <p>
                    Bills:{" "}
                    {
                      formatCurrency(
                        billTotal
                      )
                    }
                  </p>

                  <p>
                    Debt Payments:{" "}
                    {
                      formatCurrency(
                        debtTotal
                      )
                    }
                  </p>

                  <p
                    className={
                      netCashFlow >= 0
                        ? "font-bold text-green-600"
                        : "font-bold text-red-600"
                    }
                  >
                    Net Monthly Cash Flow:{" "}
                    {
                      formatCurrency(
                        netCashFlow
                      )
                    }
                  </p>
                </div>
              </Card>
            );
          }
        )}
      </div>
    </PageContainer>
  );
}