import {
  Home,
  CreditCard,
  Wallet,
  Target,
  Settings,
  ScanLine,
} from "lucide-react";
import { CalendarDays } from "lucide-react";
import { NavLink } from "react-router-dom";
 
const navItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: Home,
  },
  {
    label: "Bills",
    path: "/bills",
    icon: CreditCard,
  },
  {
    label: "Scan",
    path: "/statement-scanner",
    icon: ScanLine,
  },
  {
  label: "Calendar",
  path: "/calendar",
  icon: CalendarDays,
  },
  {
    label: "Income",
    path: "/income",
    icon: Wallet,
  },
  {
    label: "Debts",
    path: "/debts",
    icon: Target,
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
                  size={30}
                  strokeWidth={isActive ? 2.8 : 2}
                />
 
                <span className="text-xs font-semibold">
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
