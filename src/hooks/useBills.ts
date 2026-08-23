import { useEffect, useState } from "react";
import { Bill } from "../types/Bill";
import { loadBills, saveBills } from "../utils/storage";

function sortBills(a: Bill, b: Bill) {
  return String(a.dueDate ?? "").localeCompare(
    String(b.dueDate ?? "")
  );
}

export function useBills() {
  const [bills, setBills] = useState<Bill[]>(() => {
    const loadedBills = loadBills();

    return loadedBills.sort(sortBills);
  });

  useEffect(() => {
    saveBills(bills);
  }, [bills]);

  function addBill(bill: Bill) {
    setBills((prev) =>
      [...prev, bill].sort(sortBills)
    );
  }

  function updateBill(updatedBill: Bill) {
    setBills((prev) =>
      prev
        .map((bill) =>
          bill.id === updatedBill.id
            ? {
                ...updatedBill,
                updatedAt: new Date().toISOString(),
              }
            : bill
        )
        .sort(sortBills)
    );
  }

  function deleteBill(id: string) {
    setBills((prev) =>
      prev
        .filter((bill) => bill.id !== id)
        .sort(sortBills)
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
              }
            : bill
        )
        .sort(sortBills)
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