import Card from "../common/Card";
import { Debt } from "../../types/Debt";
import { formatCurrency }
  from "../../utils/formatCurrency";

interface Props {
  debt: Debt | null;
  strategy: "avalanche" | "snowball";
  extraPayment: number;
}

export default function RecommendedDebt({
  debt,
  strategy,
  extraPayment,
}: Props) {

  if (!debt) {
    return null;
  }

  const balance =
    debt.statementBalance ??
    debt.balance;

  return (
    <Card>
      <h3 className="text-lg font-bold">
        🎯 Recommended Debt
      </h3>

      <div className="mt-3 space-y-2">

        <p className="font-semibold">
          {debt.name}
        </p>

        <p>
          Balance:
          {" "}
          {formatCurrency(balance)}
        </p>

        <p>
          APR:
          {" "}
          {debt.interestRate.toFixed(2)}%
        </p>

        <p>
          Apply your extra
          {" "}
          {formatCurrency(extraPayment)}
          {" "}
          here.
        </p>

        <p className="text-sm text-slate-600">
          Reason:
          {" "}
          {strategy === "avalanche"
            ? "Highest interest rate in your portfolio."
            : "Smallest balance in your portfolio."}
        </p>

      </div>
    </Card>
  );
}