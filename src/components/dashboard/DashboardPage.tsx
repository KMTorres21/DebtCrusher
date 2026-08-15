import UpcomingBills from "./UpcomingBills";
import { useBills } from "../../hooks/useBills";

export default function DashboardPage() {
  const { bills } = useBills();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-slate-500">
          Your financial snapshot
        </p>
      </div>

      <UpcomingBills bills={bills} />
    </div>
  );
}