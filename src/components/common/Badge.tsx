import clsx from "clsx";

type Variant = "paid" | "overdue" | "due" | "scheduled";

interface BadgeProps {
  variant: Variant;
}

export default function Badge({ variant }: BadgeProps) {
  const config = {
    paid: {
      text: "Paid",
      className:
        "bg-emerald-100 text-emerald-700",
    },
    overdue: {
      text: "Overdue",
      className:
        "bg-red-100 text-red-700",
    },
    due: {
      text: "Due Soon",
      className:
        "bg-amber-100 text-amber-700",
    },
    scheduled: {
      text: "Scheduled",
      className:
        "bg-blue-100 text-blue-700",
    },
  };

  return (
    <span
      className={clsx(
        "rounded-full px-3 py-1 text-xs font-semibold",
        config[variant].className
      )}
    >
      {config[variant].text}
    </span>
  );
}