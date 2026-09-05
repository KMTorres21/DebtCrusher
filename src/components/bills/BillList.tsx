import { Bill } from "../../types/Bill";
import BillCard from "./BillCard";
import { onConvertToDebt } from "../../types/Bill";

interface BillListProps {
  bills: Bill[];
  onTogglePaid: (id: string) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onConvertToDebt: (bill: Bill) => void;
}

export default function BillList({
  bills,
  onTogglePaid,
  onEdit,
  onDelete,
}: BillListProps) {
  if (bills.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        No bills found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bills.map((bill) => (
        <BillCard
          key={bill.id}
          bill={bill}
          onTogglePaid={onTogglePaid}
          onEdit={onEdit}
          onDelete={onDelete}
          onConvertToDebt={onConvertToDebt}
        />
      ))}
    </div>
  );
}