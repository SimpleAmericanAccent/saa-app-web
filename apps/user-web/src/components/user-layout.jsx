import useAuthStore from "frontend/src/stores/auth-store";
import { useEffect } from "react";
import { SidebarLeft } from "frontend/src/components/sidebar-left";
import { MobileNav } from "frontend/src/components/mobile-nav";

export default function UserLayout({ children }) {
  const { isLoggedOut, fetchAdminStatus } = useAuthStore();

  useEffect(() => {
    if (isLoggedOut === true) {
      window.location.replace("/logout");
    }
  }, [isLoggedOut]);

  useEffect(() => {
    fetchAdminStatus();
  }, [fetchAdminStatus]);

  return (
    <div className="w-screen h-screen flex flex-col">
      <MobileNav />
      <div className="flex flex-1">
        <SidebarLeft />
        <main className="flex-1 transition-all duration-200 pt-[var(--navbar-height)] md:pt-0 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
