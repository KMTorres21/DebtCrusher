import Card from "../common/Card";
import { Bill } from "../../types/Bill";
import { Debt } from "../../types/Debt";
import { Income } from "../../types/Income";

interface Props {
  bills: Bill[];
  debts: Debt[];
  income: Income[];
}

interface TimelineEvent {
  date: string;
  title: string;
  icon: string;
}

export default function FinancialTimeline({
  bills,
  debts,
  income,
}: Props) {
  const today = new Date();
    today.setHours(0, 0, 0);

  const events: TimelineEvent[] = [];

  bills.forEach((bill) => {
    if (bill.statementDate) {
      events.push({
        date: bill.statementDate,
        title: `${bill.name} Statement`,
        icon: "📄",
      });
    }

    events.push({
      date: bill.dueDate,
      title: `${bill.name} Due`,
      icon: "💳",
    });
  });

  debts.forEach((debt) => {
    if (debt.statementDate) {
      events.push({
        date: debt.statementDate,
        title: `${debt.name} Statement`,
        icon: "📄",
      });
    }

    events.push({
      date: debt.dueDate,
      title: `${debt.name} Due`,
      icon: "💳",
    });
  });

  income.forEach((item) => {
    events.push({
      date: item.nextPayDate,
      title: item.source,
      icon: "💵",
    });
  });

  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10);

  return (
    <Card>
      <h3 className="mb-4 text-lg font-bold">
        📅 Upcoming Financial Timeline
      </h3>

      <div className="space-y-3">
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-slate-500">
            No upcoming events.
          </p>
        ) : (
          upcomingEvents.map((event, index) => (
            <div
              key={`${event.date}-${index}`}
              className="flex items-center justify-between"
            >
              <span className="font-medium">
                {event.icon} {event.title}
              </span>

              <span className="text-sm text-slate-500">
                {event.date}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}