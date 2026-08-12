import { useEffect, useState } from "react";
import { Bill } from "../types/Bill";
import { loadBills, saveBills } from "../utils/storage";
 
export function useBills() {
  const [bills, setBills] = useState<Bill[]>(loadBills());
 
  useEffect(() => {
    saveBills(bills);
  }, [bills]);
 
  function addBill(
    bill: Omit<Bill, "id" | "createdAt">
  ) {
    const newBill: Bill = {
      ...bill,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
 
    setBills((prev) => [...prev, newBill]);
  }
 
  function deleteBill(id: string) {
    setBills((prev) =>
      prev.filter((bill) => bill.id !== id)
    );
  }
 
  function togglePaid(id: string) {
    setBills((prev) =>
      prev.map((bill) =>
        bill.id === id
          ? { ...bill, paid: !bill.paid }
          : bill
      )
    );
  }
 
  return {
    bills,
    addBill,
    deleteBill,
    togglePaid,
  };
}
