import { Bill } from "../types/Bill";
 
export type DueDateStatus =
  | "paid"
  | "overdue"
  | "today"
  | "soon"
  | "upcoming";
 
export interface DueDateInfo {
  status: DueDateStatus;
  label: string;
  daysUntilDue: number | null;
}
 
export function getDueDateInfo(bill: Bill): DueDateInfo {
  if (bill.paid) {
    return {
      status: "paid",
      label: "Paid",
      daysUntilDue: null,
    };
  }
 
  const today = new Date();
 
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
 
  let dueDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    bill.dueDay
  );
 
  // If this month's due date has already passed,
  // the next occurrence is next month.
  if (dueDate < todayStart) {
    dueDate = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      bill.dueDay
    );
  }
 
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
 
  const daysUntilDue = Math.round(
    (dueDate.getTime() - todayStart.getTime()) /
      millisecondsPerDay
  );
 
  if (daysUntilDue === 0) {
    return {
      status: "today",
      label: "Due Today",
      daysUntilDue,
    };
  }
 
  if (daysUntilDue <= 3) {
    return {
      status: "soon",
      label: `Due in ${daysUntilDue} day${
        daysUntilDue === 1 ? "" : "s"
      }`,
      daysUntilDue,
    };
  }
 
  return {
    status: "upcoming",
    label: `Due ${dueDate.toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric",
      }
    )}`,
    daysUntilDue,
  };
}
