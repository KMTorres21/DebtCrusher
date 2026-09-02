import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import PaydayStrategyPage from "../pages/PaydayStrategyPage";
import DashboardPage from "../pages/DashboardPage";
import BillsPage from "../pages/BillsPage";
import IncomePage from "../pages/IncomePage";
import DebtsPage from "../pages/DebtsPage";
import SettingsPage from "../pages/SettingsPage";
import CalendarPage from "../pages/CalendarPage";
import StatementScannerPage from "../pages/StatementScannerPage";
import DebtPlannerPage from "../pages/DebtPlannerPage";

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
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/timeline" element={<PaydayStrategyPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/statement-scanner" element={<StatementScannerPage />}
      />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}