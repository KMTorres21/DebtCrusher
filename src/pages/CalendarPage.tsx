import PageContainer from "../components/layout/PageContainer";
import PageHeader from "../components/layout/PageHeader";

export default function CalendarPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Cash Flow Calendar"
        subtitle="See your money throughout the month"
      />

      <div className="rounded-2xl bg-white p-6 shadow">
        <p className="text-slate-500">
          Calendar coming in Sprint 3...
        </p>
      </div>
    </PageContainer>
  );
}