import {
  Home,
  CreditCard,
  Wallet,
  Target,
  CalendarDays,
  ScanLine,
  BarChart3,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: Home,
  },
  {
    label: "Scanner",
    path: "/statement-scanner",
    icon: ScanLine,
  },
  {
    label: "Income",
    path: "/income",
    icon: Wallet,
  },
  {
    label: "Bills",
    path: "/bills",
    icon: CreditCard,
  },
  {
    label: "Debts",
    path: "/debts",
    icon: Target,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
  },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white shadow-lg">
      <div className="mx-auto flex max-w-3xl items-stretch justify-around">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex min-h-[72px] flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                isActive
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-800"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={28}
                  strokeWidth={isActive ? 2.8 : 2}
                />

                <span className="text-[10px] font-semibold">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}