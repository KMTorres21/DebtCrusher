import { formatCurrency } from "../../utils/formatCurrency";
import { Bill } from "../../types/Bill";
import Card from "../common/Card";
import Badge from "../common/Badge";
import Button from "../common/Button";

interface BillCardProps {
  bill: Bill;
  showStatementDate?: boolean;
  onTogglePaid: (id: string) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onConvertToDebt: (bill: Bill) => void;
}

export default function BillCard({
  bill,
  showStatementDate = true,
  onTogglePaid,
  onEdit,
  onDelete,
  onConvertToDebt,
}: BillCardProps) {
  const status = bill.paid ? "paid" : "due";

  return (
    <Card className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{bill.name}</h3>

          <p className="text-sm text-slate-500">
            {bill.category}
          </p>
        </div>

        <Badge variant={status} />
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-2xl font-bold">
            {formatCurrency(bill.amount)}
          </p>

          <p className="text-sm text-slate-500">
            Due Date: {bill.dueDate}
          </p>
          {showStatementDate && bill.statementDate && (
            <p className="text-sm text-slate-500">
              Statement Date: {bill.statementDate}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="success"
          onClick={() => onTogglePaid(bill.id)}
        >
          {bill.paid ? "Mark Unpaid" : "Mark Paid"}
        </Button>

        <Button
          variant="secondary"
          onClick={() => onEdit(bill)}
        >
          Edit
        </Button>

        <Button
          variant="danger"
          onClick={() => onDelete(bill.id)}
        >
          Delete
        </Button>
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => onConvertToDebt(bill)}
          >
          🔄 Convert to Debt
        </Button>
      </div>
    </Card>
  );
}