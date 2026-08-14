import { Debt } from "../types/Debt";

const STORAGE_KEY = "debtcrusher-debts";

export function loadDebts(): Debt[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) return [];

  try {
    return JSON.parse(stored);
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