import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import TimelinePage from "../pages/TimelinePage";
import DashboardPage from "../pages/DashboardPage";
import BillsPage from "../pages/BillsPage";
import IncomePage from "../pages/IncomePage";
import PaydayStrategyPage from "../pages/PaydayStrategyPage";
import DebtsPage from "../pages/DebtsPage";
import DebtPlannerPage from "../pages/DebtPlannerPage";
import SettingsPage from "../pages/SettingsPage";
import CalendarPage from "../pages/CalendarPage";
import StatementScannerPage from "../pages/StatementScannerPage";
import ReportsPage from "../pages/ReportsPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/bills" element={<BillsPage />} />
          <Route path="/income" element={<IncomePage />} />
          <Route path="/debts" element={<DebtsPage />} />
          <Route path="/debt-planner" element={<DebtPlannerPage />} />
          <Route path="/payday-strategy" element={<PaydayStrategyPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/statement-scanner" element={<StatementScannerPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}