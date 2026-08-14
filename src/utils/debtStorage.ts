import { Debt } from "../types/Debt";

const STORAGE_KEY = "debtcrusher-debts";

export function loadDebts(): Debt[] {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveDebts(debts: Debt[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(debts)
  );
}
