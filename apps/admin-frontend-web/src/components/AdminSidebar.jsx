import { Link } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <aside className="w-64 border-r bg-muted p-4">
      <ul className="space-y-2">
        <li>
          <Link to="/admin">Dashboard</Link>
        </li>
        <li>
          <Link to="/wls-data">WLS Data</Link>
        </li>
        <li>
          <Link to="/dictionary-admin">Dictionary</Link>
        </li>
        {/* future: logs, settings, team, etc */}
      </ul>
    </aside>
  );
}
