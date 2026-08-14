import { useEffect, useState } from "react";
import { Income } from "../types/Income";
import { loadIncome, saveIncome } from "../utils/incomeStorage";

export function useIncome() {
  const [income, setIncome] = useState<Income[]>(() => loadIncome());

  useEffect(() => {
    saveIncome(income);
  }, [income]);

  function addIncome(item: Income) {
    setIncome((prev) =>
      [...prev, item].sort((a, b) =>
        a.nextPayDate.localeCompare(b.nextPayDate)
      )
    );
  }

  function updateIncome(updatedIncome: Income) {
    setIncome((prev) =>
      prev
        .map((item) =>
          item.id === updatedIncome.id
            ? {
                ...updatedIncome,
                updatedAt: new Date().toISOString(),
              }
            : item
        )
        .sort((a, b) =>
          a.nextPayDate.localeCompare(b.nextPayDate)
        )
    );
  }

  function deleteIncome(id: string) {
    setIncome((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }

  return {
    income,
    addIncome,
    updateIncome,
    deleteIncome,
};