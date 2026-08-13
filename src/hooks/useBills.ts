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
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
);
}

  function deleteBill(id: string) {
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
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
);
  }

  function togglePaid(id: string) {
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