import PageContainer from "../components/common/PageContainer";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";

import TimelineList from "../components/timeline/TimelineList";

import { useBills } from "../hooks/useBills";
import { useDebts } from "../hooks/useDebts";
import { useIncome } from "../hooks/useIncome";

import { buildTimeline } from "../utils/buildTimeline";

export default function TimelinePage() {
  const { bills } = useBills();
  const { debts } = useDebts();
  const { income } = useIncome();
  const today = new Date();

const events = buildTimeline(
  bills,
  debts,
  income,
  today.getFullYear(),
  today.getMonth()
);

  return (
    <PageContainer>

      <PageHeader
        title="Timeline"
        subtitle="Your complete financial schedule"
      />

      {events.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Nothing on your timeline"
          description="Add income, bills, or debts to start building your financial timeline."
        />
      ) : (
        <TimelineList events={events} />
      )}

    </PageContainer>
  );
}