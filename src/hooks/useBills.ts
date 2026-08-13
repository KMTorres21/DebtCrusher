import { useEffect, useState } from "react";
import { Bill } from "../types/Bill";
import { loadBills, saveBills } from "../utils/storage";

export function useBills() {
  const [bills, setBills] = useState<Bill[]>(() => loadBills());

  useEffect(() => {
    saveBills(bills);
  }, [bills]);

  function addBill(bill: Bill) {
    setBills((prev) => [...prev, bill]);
  }

 function updateBill(updatedBill: Bill) {
  setBills((prev) =>
    prev.map((bill) =>
      bill.id === updatedBill.id ? updatedBill : bill
    )
  );
}

  function deleteBill(id: string) {
    setBills((prev) => prev.filter((bill) => bill.id !== id));
  }

  function togglePaid(id: string) {
    setBills((prev) =>
      prev.map((bill) =>
        bill.id === id
          ? {
              ...bill,
              paid: !bill.paid,
              updatedAt: new Date().toISOString(),
            }
          : bill
      )
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