import { Income } from "../types/Income";

function parseDate(dateString: string): Date {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getCurrentNextPayDate(
  income: Income,
  today = new Date()
): string {
  const currentDate = new Date(today);
  currentDate.setHours(0, 0, 0, 0);

  let payDate = parseDate(income.nextPayDate);
  payDate.setHours(0, 0, 0, 0);

  if (income.frequency === "onetime") {
    return formatDate(payDate);
  }

  if (income.frequency === "biweekly") {
    while (payDate < currentDate) {
      payDate.setDate(payDate.getDate() + 14);
    }

    return formatDate(payDate);
  }

  if (income.frequency === "weekly") {
    while (payDate < currentDate) {
      payDate.setDate(payDate.getDate() + 7);
    }

    return formatDate(payDate);
  }

  if (income.frequency === "monthly") {
    while (payDate < currentDate) {
      payDate.setMonth(payDate.getMonth() + 1);
    }

    return formatDate(payDate);
  }

  // semimonthly
  while (payDate < currentDate) {
    payDate.setDate(payDate.getDate() + 15);
  }

  return formatDate(payDate);
}