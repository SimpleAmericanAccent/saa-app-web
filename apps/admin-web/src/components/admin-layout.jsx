import AdminSidebar from "./admin-sidebar";
import useAuthStore from "frontend/src/stores/auth-store";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const { isLoggedOut } = useAuthStore();

  // useEffect(() => {
  //   if (isLoggedOut === true) {
  //     window.location.replace("/logout");
  //   }
  // }, [isLoggedOut]);
  return (
    <div className="flex h-screen w-full">
      <AdminSidebar /> {/* Optional left panel */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="sticky top-0 z-50"></div>

        <main>{children}</main>
      </div>
    </div>
  );
}
