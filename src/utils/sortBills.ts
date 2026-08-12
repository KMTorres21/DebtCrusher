import { Bill } from "../types/Bill";
import { getDueDateInfo } from "./dueDate";

const priority = {
  overdue: 0,
  today: 1,
  soon: 2,
  upcoming: 3,
  paid: 4,
};

export function sortBills(bills: Bill[]): Bill[] {
  return [...bills].sort((a, b) => {
    const aDue = getDueDateInfo(a);
    const bDue = getDueDateInfo(b);

    const priorityDiff =
      priority[aDue.status] - priority[bDue.status];

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    // Within the same status, sort by due day.
    return a.dueDay - b.dueDay;
  });
}