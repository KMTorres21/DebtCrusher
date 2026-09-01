import { Settings } from "lucide-react";
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

        <Link
          to="/settings"
          aria-label="Settings"
          className="rounded-full p-3 hover:bg-blue-600"
        >
          <Settings size={30} />
        </Link>

      </div>
    </header>
  );
}