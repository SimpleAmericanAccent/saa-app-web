import useAuthStore from "core-frontend-web/src/stores/authStore";
import { useEffect } from "react";
import { SidebarLeft } from "core-frontend-web/src/components/sidebar-left";

export default function UserLayout({ children }) {
  const { isLoggedOut } = useAuthStore();

  useEffect(() => {
    if (isLoggedOut === true) {
      window.location.replace("/logout");
    }
  }, [isLoggedOut]);

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex flex-1">
        <SidebarLeft />
        <main className="flex-1 transition-all duration-200">{children}</main>
      </div>
    </div>
  );
}
