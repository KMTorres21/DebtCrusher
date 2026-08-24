import { formatCurrency } from "../../utils/formatCurrency";
import { getDueDateInfo } from "../../utils/dueDate";
import { Bill } from "../../types/Bill";

import Card from "../common/Card";
import Badge from "../common/Badge";
import Button from "../common/Button";

interface BillCardProps {
  bill: Bill;
  onTogglePaid: (id: string) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
}

export default function BillCard({
  bill,
  onTogglePaid,
  onEdit,
  onDelete,
}: BillCardProps) {
  const status = bill.paid ? "paid" : "due";

  const dueDateInfo = getDueDateInfo(
    bill.dueDate
  );

  let dueStatus = "";

  if (!bill.paid) {
    if (dueDateInfo.isOverdue) {
      dueStatus = `${dueDateInfo.daysOverdue} ${
        dueDateInfo.daysOverdue === 1
          ? "day"
          : "days"
      } overdue`;
    } else if (dueDateInfo.isToday) {
      dueStatus = "Due today";
    } else if (dueDateInfo.daysUntilDue <= 7) {
      dueStatus = `Due in ${dueDateInfo.daysUntilDue} ${
        dueDateInfo.daysUntilDue === 1
          ? "day"
          : "days"
      }`;
    }
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {bill.name}
          </h3>

          <p className="text-sm text-slate-500">
            {bill.category}
          </p>
        </div>

        <Badge variant={status} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">
            {formatCurrency(bill.amount)}
          </p>

          <p className="text-sm text-slate-500">
            Due {dueDateInfo.formattedDate}
          </p>

          {dueStatus && (
            <p
              className={`mt-1 text-sm font-semibold ${
                dueDateInfo.isOverdue
                  ? "text-red-600"
                  : dueDateInfo.isToday
                    ? "text-orange-600"
                    : "text-orange-600"
              }`}
            >
              {dueStatus}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="success"
          onClick={() =>
            onTogglePaid(bill.id)
          }
        >
          {bill.paid
            ? "Mark Unpaid"
            : "Mark Paid"}
        </Button>

        <Button
          variant="secondary"
          onClick={() => onEdit(bill)}
        >
          Edit
        </Button>

        <Button
          variant="danger"
          onClick={() =>
            onDelete(bill.id)
          }
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}