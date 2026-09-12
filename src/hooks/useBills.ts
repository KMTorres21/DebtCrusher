import { useEffect, useState } from "react";
import { Bill } from "../types/Bill";
import { loadBills, saveBills } from "../utils/storage";

export function useBills() {
  const [bills, setBills] = useState<Bill[]>(() => loadBills());

  useEffect(() => {
    saveBills(bills);
  }, [bills]);

  function addBill(bill: Bill) {
    setBills((prev) =>
      [...prev, bill].sort((a, b) =>
        a.dueDate.localeCompare(b.dueDate)
      )
    );
  }

  function togglePaid(id: string) {
    setBills((prev) =>
      prev
        .map((bill) =>
          bill.id === id
            ? {
                ...bill,
                paid: !bill.paid,
                updatedAt: new Date().toISOString(),
                activityHistory: [
                  ...(bill.activityHistory ?? []),
                  {
                    id: crypto.randomUUID(),
                    date: new Date().toISOString(),
                    action: bill.paid ? "Marked Unpaid" : "Marked Paid",
                  },
                ],
              }
            : bill
        )
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    );
  }

  return {
    bills,
    addBill,
    updateBill,
    deleteBill,
    togglePaid,
  };
}