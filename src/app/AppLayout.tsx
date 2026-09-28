import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import BottomNav from "../components/common/BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-100">

      <Header />

      <main className="min-h-[calc(100vh-140px)] pb-24">
        <Outlet />
      </main>

      <BottomNav />

    </div>
  );
}