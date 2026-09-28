export interface DueDateInfo {
  formattedDate: string;
  isOverdue: boolean;
  isToday: boolean;
  daysUntilDue: number;
  daysOverdue: number;
}

export function getDueDateInfo(dueDate: string): DueDateInfo {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return {
    formattedDate: due.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    isOverdue: diffDays < 0,
    isToday: diffDays === 0,
    daysUntilDue: diffDays > 0 ? diffDays : 0,
    daysOverdue: diffDays < 0 ? Math.abs(diffDays) : 0,
  };
}