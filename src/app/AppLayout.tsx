import { Outlet } from "react-router-dom";

import Header from "../components/common/Header";
import BottomNav from "../components/common/BottomNav";
import PageContainer from "../components/common/PageContainer";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 pb-24">
        <PageContainer>
          <Outlet />
        </PageContainer>
      </main>

      <BottomNav />
    </div>
  );
}
