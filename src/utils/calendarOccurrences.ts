import { Bill } from "../types/Bill";
import { Income } from "../types/Income";

function toDateString(date: Date): string {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
<<<<<<< HEAD
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
=======
  return result;
}

export function getBillOccurrences(
  bill: Bill,
  year: number,
  month: number
): string[] {
  if (!bill.recurring) {
    return [bill.dueDate];
  }

  const originalDate = new Date(`${bill.dueDate}T12:00:00`);

  if (Number.isNaN(originalDate.getTime())) {
    return [];
  }

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  if (originalDate > monthEnd) {
    return [];
  }

  const day = originalDate.getDate();

  const occurrence = new Date(
    year,
    month + 1,
    0
  );

  occurrence.setDate(
    Math.min(
      day,
      new Date(year, month + 1, 0).getDate()
    )
  );

  if (occurrence < monthStart) {
    return [];
  }

  return [toDateString(occurrence)];
}

export function getIncomeOccurrences(
  income: Income,
  year: number,
  month: number
): string[] {
  const originalDate = new Date(
    `${income.nextPayDate}T12:00:00`
  );

  if (Number.isNaN(originalDate.getTime())) {
    return [];
  }

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const monthStart = new Date(

  const occurrences: string[] = [];

<<<<<<< HEAD
  if (income.frequency === "onetime") {
=======
  const frequency =
    bill.frequency ??
    (bill.recurring
      ? "monthly"
      : "once");

  // One-time bill
  if (
    !bill.recurring ||
    frequency === "once"
  ) {
>>>>>>> 6393a08c085a54efdb0154c146eedb177741f89f
    if (
      originalDate >= monthStart &&
      originalDate <= monthEnd
    ) {
      occurrences.push(toDateString(originalDate));
    }

    return occurrences;
  }

<<<<<<< HEAD
  if (income.frequency === "monthly") {
    const day = originalDate.getDate();

    const occurrence = new Date(
=======
  // Weekly / Bi-Weekly
  if (
    frequency === "weekly" ||
    frequency === "biweekly"
  ) {
    const intervalDays =
      frequency === "weekly"
        ? 7
        : 14;

    let occurrence =
      new Date(originalDate);

    while (occurrence < monthStart) {
      occurrence = addDays(
        occurrence,
        intervalDays
      );
    }

    while (occurrence <= monthEnd) {
      occurrences.push(
        toDateString(occurrence)
      );

      occurrence = addDays(
        occurrence,
        intervalDays
      );
    }

    return occurrences;
  }

  // Semi-Monthly
  if (frequency === "semimonthly") {
    let occurrence =
      new Date(originalDate);

    while (occurrence < monthStart) {
      occurrence = addDays(
        occurrence,
        15
      );
    }

    while (occurrence <= monthEnd) {
      occurrences.push(
        toDateString(occurrence)
      );

      occurrence = addDays(
        occurrence,
        15
      );
    }

    return occurrences;
  }

  const originalYear =
    originalDate.getFullYear();

  const originalMonth =
    originalDate.getMonth();

  const monthDifference =
    (year - originalYear) * 12 +
    (month - originalMonth);

  if (monthDifference < 0) {
    return [];
  }

  let intervalMonths = 1;

  if (frequency === "quarterly") {
    intervalMonths = 3;
  } else if (
    frequency === "semiannually"
  ) {
    intervalMonths = 6;
  } else if (
    frequency === "annually"
  ) {
    intervalMonths = 12;
  }

  if (
    monthDifference %
      intervalMonths !==
    0
  ) {
    return [];
  }

  const originalDay =
    originalDate.getDate();

  const lastDayOfMonth =
    new Date(
>>>>>>> 6393a08c085a54efdb0154c146eedb177741f89f
      year,
      month,
      Math.min(
        day,
        new Date(year, month + 1, 0).getDate()
      )
    );

    if (
      occurrence >= monthStart &&
      occurrence <= monthEnd
    ) {
      occurrences.push(toDateString(occurrence));
    }

    return occurrences;
  }

  if (income.frequency === "semimonthly") {
    let occurrence = new Date(originalDate);

    while (occurrence < monthStart) {
      occurrence = addDays(occurrence, 15);
    }

    while (occurrence <= monthEnd) {
      occurrences.push(toDateString(occurrence));
      occurrence = addDays(occurrence, 15);
    }

    return occurrences;
  }

  const intervalDays =
    income.frequency === "weekly"
      ? 7
      : income.frequency === "biweekly"
        ? 14
        : 0;

  if (intervalDays === 0) {
    return [];
  }

  let occurrence = new Date(originalDate);

  /*
   * Move forward from the stored next payday until
   * we reach the selected month.
   */
  while (occurrence < monthStart) {
    occurrence = addDays(
      occurrence,
      intervalDays
    );
  }

  /*
   * Generate every payday in the selected month.
   */
  while (occurrence <= monthEnd) {
    occurrences.push(toDateString(occurrence));

    occurrence = addDays(
      occurrence,
      intervalDays
    );
  }

  return occurrences;
}
<<<<<<< HEAD
=======

export function getIncomeOccurrences(
  income: Income,
  year: number,
  month: number
): string[] {
  const originalDate = new Date(
    `${income.nextPayDate}T12:00:00`
  );

  if (Number.isNaN(originalDate.getTime())) {
    return [];
  }

  const monthStart = new Date(
    year,
    month,
    1
  );

  const monthEnd = new Date(
    year,
    month + 1,
    0
  );

  const occurrences: string[] = [];

  if (income.frequency === "onetime") {
    if (
      originalDate >= monthStart &&
      originalDate <= monthEnd
    ) {
      occurrences.push(
        toDateString(originalDate)
      );
    }

    return occurrences;
  }

  if (income.frequency === "monthly") {
    const day =
      originalDate.getDate();

    const occurrence = new Date(
      year,
      month,
      Math.min(
        day,
        new Date(
          year,
          month + 1,
          0
        ).getDate()
      )
    );

    if (
      occurrence >= monthStart &&
      occurrence <= monthEnd
    ) {
      occurrences.push(
        toDateString(occurrence)
      );
    }

    return occurrences;
  }

  if (
    income.frequency ===
    "semimonthly"
  ) {
    let occurrence =
      new Date(originalDate);

    while (occurrence < monthStart) {
      occurrence = addDays(
        occurrence,
        15
      );
    }

    while (occurrence <= monthEnd) {
      occurrences.push(
        toDateString(occurrence)
      );

      occurrence = addDays(
        occurrence,
        15
      );
    }

    return occurrences;
  }

  const intervalDays =
    income.frequency === "weekly"
      ? 7
      : income.frequency ===
          "biweekly"
        ? 14
        : 0;

  if (intervalDays === 0) {
    return [];
  }

  let occurrence =
    new Date(originalDate);

  while (occurrence < monthStart) {
    occurrence = addDays(
      occurrence,
      intervalDays
    );
  }

  while (occurrence <= monthEnd) {
    occurrences.push(
      toDateString(occurrence)
    );

    occurrence = addDays(
      occurrence,
      intervalDays
    );
  }

  return occurrences;
}
>>>>>>> 6393a08c085a54efdb0154c146eedb177741f89f
