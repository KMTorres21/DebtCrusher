import { Bill } from "../types/Bill";

export function sortBills(bills: Bill[]): Bill[] {
  return [...bills].sort((a, b) => {
    // Paid bills always go to the bottom
    if (a.paid !== b.paid) {
      return a.paid ? 1 : -1;
    }

    // Sort unpaid bills by due date (earliest first)
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();

    if (dateA !== dateB) {
      return dateA - dateB;
    }

    // If due dates are the same, sort alphabetically
    return a.name.localeCompare(b.name);
  });
}