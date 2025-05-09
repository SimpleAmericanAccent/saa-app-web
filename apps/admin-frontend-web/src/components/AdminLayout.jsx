import NavBar from "core-frontend-web/src/components/NavBar";
import AdminSidebar from "./AdminSidebar";
import AdminTopBarExtras from "./AdminTopBarExtras";
import useAuthStore from "core-frontend-web/src/stores/authStore";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const { isLoggedOut } = useAuthStore();

  useEffect(() => {
    if (isLoggedOut === true) {
      window.location.replace("/logout");
    }
  }, [isLoggedOut]);
  return (
    <div className="flex h-screen w-full">
      <AdminSidebar /> {/* Optional left panel */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="sticky top-0 z-50">
          <NavBar /> {/* The shared user NavBar */}
          <AdminTopBarExtras /> {/* New admin-only buttons or breadcrumbs */}
        </div>

        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}
