export function getBillOccurrences(
  bill: Bill,
  year: number,
  month: number
): string[] {
  const originalDate = new Date(
    `${bill.dueDate}T12:00:00`
  );

  if (Number.isNaN(originalDate.getTime())) {
    return [];
  }

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const occurrences: string[] = [];

  const frequency =
    bill.frequency ??
    (bill.recurring ? "monthly" : "once");

  // One-time bill
  if (!bill.recurring || frequency === "once") {
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

  // Weekly / bi-weekly
  if (
    frequency === "weekly" ||
    frequency === "biweekly"
  ) {
    const intervalDays =
      frequency === "weekly" ? 7 : 14;

    let occurrence = new Date(originalDate);

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

  // Semi-monthly
  if (frequency === "semimonthly") {
    let occurrence = new Date(originalDate);

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
  } else if (frequency === "semiannually") {
    intervalMonths = 6;
  } else if (frequency === "annually") {
    intervalMonths = 12;
  }

  if (
    monthDifference % intervalMonths !== 0
  ) {
    return [];
  }

  const originalDay =
    originalDate.getDate();

  const lastDayOfMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const occurrence = new Date(
    year,
    month,
    Math.min(
      originalDay,
      lastDayOfMonth
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