import { Income } from "../types/Income";

const STORAGE_KEY = "debtcrusher_income";

export function loadIncome(): Income[] {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveIncome(income: Income[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(income)
  );
}