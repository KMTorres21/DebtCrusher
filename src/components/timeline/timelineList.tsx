import TimelineCard from "./TimelineCard";
import { TimelineEvent } from "../../types/TimelineEvent";

interface TimelineListProps {
  events: TimelineEvent[];
}

export default function TimelineList({
  events,
}: TimelineListProps) {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <TimelineCard
          key={`${event.type}-${event.id}`}
          event={event}
        />
      ))}
    </div>
  );
}