import { useEffect, useState } from "react";
import { Debt } from "../types/Debt";
import { loadDebts, saveDebts } from "../utils/debtStorage";

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>(() => loadDebts());

  useEffect(() => {
    saveDebts(debts);
  }, [debts]);

  function addDebt(debt: Debt) {
    setDebts((prev) =>
      [...prev, debt].sort((a, b) =>
        a.dueDate.localeCompare(b.dueDate)
      )
    );
  }

  function updateDebt(updatedDebt: Debt) {
    setDebts((prev) =>
      prev
        .map((debt) =>
          debt.id === updatedDebt.id
            ? {
                ...updatedDebt,
                updatedAt: new Date().toISOString(),
              }
            : debt
        )
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    );
  }

  function deleteDebt(id: string) {
    setDebts((prev) =>
      prev
        .filter((debt) => debt.id !== id)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    );
  }

  return {
    debts,
    addDebt,
    updateDebt,
    deleteDebt,
  };
}