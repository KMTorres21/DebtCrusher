interface Props {
  status: "paid" | "overdue" | "today" | "soon" | "upcoming";
}

export default function StatusBadge({ status }: Props) {
  const styles = {
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
    today: "bg-orange-100 text-orange-700",
    soon: "bg-yellow-100 text-yellow-700",
    upcoming: "bg-blue-100 text-blue-700",
  };

  const labels = {
    paid: "Paid",
    overdue: "Overdue",
    today: "Today",
    soon: "Due Soon",
    upcoming: "Upcoming",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
