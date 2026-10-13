import {
  FileScan,
  Settings,
} from "lucide-react";

import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-blue-700 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">

        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <div className="text-4xl">
            💰
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              DebtBeGone!!
            </h1>

            <p className="text-sm text-blue-100">
              Crush debt. Build wealth.
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/statement-scanner"
            aria-label="Scan Statement"
            title="Scan Statement"
            className="flex items-center gap-2 rounded-full px-3 py-3 hover:bg-blue-600"
          >
            <FileScan size={30} />

            <span className="hidden sm:inline text-sm font-semibold">
              Scan Statement
            </span>
          </Link>

          <Link
            to="/settings"
            aria-label="Settings"
            title="Settings"
            className="rounded-full p-3 hover:bg-blue-600"
          >
            <Settings size={30} />
          </Link>
        </div>

      </div>
    </header>
  );
}