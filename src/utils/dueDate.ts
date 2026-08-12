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
 
  // If the requested day doesn't exist in this month,
  // use the last day of the month.
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
 
  const actualDueDay = Math.min(
    bill.dueDay,
    daysInMonth
  );
 
  // IMPORTANT:
  // Always use the CURRENT month here.
  // A past due date is overdue; it does not roll
  // forward to the next month.
  const dueDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    actualDueDay
  );
  console.log("TODAY:", today);
  console.log("DUE DATE:", dueDate);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
 
  const daysUntilDue = Math.round(
    (dueDate.getTime() - todayStart.getTime()) /
      millisecondsPerDay
  );
 
  if (daysUntilDue < 0) {
    const daysOverdue = Math.abs(daysUntilDue);
 
    return {
      status: "overdue",
      label: `Overdue by ${daysOverdue} day${
        daysOverdue === 1 ? "" : "s"
      }`,
      daysUntilDue,
    };
  }
 
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
 
