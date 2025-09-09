import { Link, useLocation } from "react-router-dom";
import { cn } from "core-frontend-web/src/lib/utils"; // or your preferred class merging util

export default function AdminSidebar() {
  const location = useLocation();

  const navItems = [
    { label: "Overview", path: "/overview" },
    { label: "Acquisition Dashboard", path: "/acq" },
    { label: "User App", path: "/user" },
    { label: "Coaching", path: "/coaching" },
    { label: "Ops", path: "/ops" },
    { label: "User Trials", path: "/user-trials" },
  ];

  return (
    <aside className="w-32 bg-background border-r h-screen p-4 space-y-2">
      <div className="font-bold text-lg mb-6">Admin</div>
      <nav className="flex flex-col gap-2">
        {navItems.map(({ label, path }) => {
          const isActive = location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "block rounded px-3 py-2 text-sm font-medium hover:bg-muted",
                isActive && "bg-muted text-primary"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
