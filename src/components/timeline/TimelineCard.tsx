import Card from "../common/Card";
import { TimelineEvent } from "../../types/TimelineEvent";
import { formatCurrency } from "../../utils/formatCurrency";

interface TimelineCardProps {
  event: TimelineEvent;
}

export default function TimelineCard({
  event,
}: TimelineCardProps) {
  const isIncome = event.amount >= 0;

  return (
    <Card className="flex items-center justify-between">

      <div>
        <p className="font-semibold text-slate-900">
          {event.title}
        </p>

        <p className="text-sm text-slate-500">
          {event.date}
        </p>
      </div>

      <div className="text-right">
        <p
          className={`text-lg font-bold ${
            isIncome
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {isIncome ? "+" : ""}
          {formatCurrency(event.amount)}
        </p>

        {event.runningBalance !== undefined && (
          <p className="text-xs text-slate-500">
            Balance:{" "}
            {formatCurrency(event.runningBalance)}
          </p>
        )}
      </div>

    </Card>
  );
}