import Card from "../common/Card";
import { Bill } from "../../types/Bill";
import { Debt } from "../../types/Debt";
import { Income } from "../../types/Income";
import { formatDate } from "../../utils/formatDate";
import { getIncomeOccurrences } from "../../utils/calendarOccurrences";

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

{console.log(income)}

  const events: TimelineEvent[] = [];
  const reviewsNeeded: {
  name: string;
  statementDate: string;
  dueDate: string;
    }[] = [];


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

    if (
        bill.statementDate &&
        bill.statementDate <= today.toISOString().slice(0, 10) &&
        bill.dueDate >= today.toISOString().slice(0, 10)
        ) {
        reviewsNeeded.push({
            name: bill.name,
            statementDate: bill.statementDate,
            dueDate: bill.dueDate,
        });
        }
    });

  debts.forEach((debt) => {
    if (debt.statementDate) {
      events.push({
        date: debt.statementDate,
        title: `${debt.name} Statement`,
        icon: "📄",
      });

    if (
        debt.statementDate &&
        debt.statementDate <= today.toISOString().slice(0, 10) &&
        debt.dueDate >= today.toISOString().slice(0, 10)
        ) {
        reviewsNeeded.push({
            name: debt.name,
            statementDate: debt.statementDate,
            dueDate: debt.dueDate,
        });
        }
    }

    events.push({
      date: debt.dueDate,
      title: `${debt.name} Due`,
      icon: "💳",
    });
  });

  income.forEach((item) => {
    for
        (let offset = 0; offset <= 2; offset++) {
            const targetDate = new Date(
                today.getFullYear(),
                today.getMonth() + offset,
                1
            );
            const occurrences =
            getIncomeOccurrences(
                item,
                targetDate.getFullYear(),
                targetDate.getMonth()
            );
            occurrences.forEach((occurrence) => {
                events.push({
                    date: occurrence,
                    title: item.source,
                    icon: "💵",
                });
            });
        }
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

        {reviewsNeeded.length > 0 && (
    <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
        <h4 className="mb-3 font-semibold text-amber-800">
        ⚠ Statement Review Needed
        </h4>

        <div className="space-y-3">
        {reviewsNeeded.map((item) => {
            const due = new Date(
                `${item.dueDate}T12:00:00`
            );

            const daysUntilDue = Math.ceil(
                (
                due.getTime() -
                today.getTime()
                ) /
                (1000 * 60 * 60 * 24)
            );

    return (
        <div key={item.name}>
        <div className="font-medium">
            {item.name}
        </div>

        <div className="text-sm text-slate-600">
            Statement Available: {formatDate(item.statementDate)}
        </div>

        <div className="text-sm text-slate-600">
            Due: {formatDate(item.dueDate)}
        </div>

        <div className="text-sm font-medium text-amber-700">
            {daysUntilDue === 0
            ? "Due Today"
            : daysUntilDue === 1
            ? "Due Tomorrow"
            : `Due in ${daysUntilDue} days`}
        </div>
        </div>
         );
        })}
        </div>
    </div>
    )}
    ``

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
                {formatDate(event.date)}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}