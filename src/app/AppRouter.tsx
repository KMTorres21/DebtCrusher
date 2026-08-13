import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";

import DashboardPage from "../pages/DashboardPage";
import BillsPage from "../pages/BillsPage";
import IncomePage from "../pages/IncomePage";
import DebtsPage from "../pages/DebtsPage";
import SettingsPage from "../pages/SettingsPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/bills" element={<BillsPage />} />
          <Route path="/income" element={<IncomePage />} />
          <Route path="/debts" element={<DebtsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}