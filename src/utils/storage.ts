import { Bill } from "../types/Bill";
 
const STORAGE_KEY = "debtcrusher-bills";
 
export function loadBills(): Bill[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
 
    if (!data) return [];
 
    return JSON.parse(data);
  } catch {
    return [];
  }
}
 
export function saveBills(bills: Bill[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(bills)
  );
}
