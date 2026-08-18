import { useEffect, useState } from "react";
import { Income } from "../types/Income";
import { loadIncome, saveIncome } from "../utils/incomeStorage";
import { getCurrentNextPayDate } from "../utils/incomeDates";

export function useIncome() {
  const [income, setIncome] = useState<Income[]>(() =>
    loadIncome().map((item) => ({
      ...item,
      nextPayDate: getCurrentNextPayDate(item),
    }))
  );

  useEffect(() => {
    saveIncome(income);
  }, [income]);

  function addIncome(item: Income) {
    const updatedIncome = {
      ...item,
      nextPayDate: getCurrentNextPayDate(item),
    };

    setIncome((prev) =>
      [...prev, updatedIncome].sort((a, b) =>
        a.nextPayDate.localeCompare(b.nextPayDate)
      )
    );
  }

  function updateIncome(updatedIncome: Income) {
    const normalizedIncome = {
      ...updatedIncome,
      nextPayDate: getCurrentNextPayDate(updatedIncome),
      updatedAt: new Date().toISOString(),
    };

    setIncome((prev) =>
      prev
        .map((item) =>
          item.id === normalizedIncome.id
            ? normalizedIncome
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
}