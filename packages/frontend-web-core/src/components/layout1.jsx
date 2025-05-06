import NavBar from "frontend-web-core/src/components/NavBar.jsx";
import { SidebarRight } from "frontend-web-core/src/components/sidebar-right";
import { Outlet } from "react-router";
import useAuthStore from "frontend-web-core/src/stores/authStore";
import { useEffect } from "react";

export default function Layout1({ children }) {
  const { userRole, isLoading, isLoggedOut } = useAuthStore();

  // if (isLoading) return <div>Loading...</div>;
  // if (!userRole) return null;

  if (isLoggedOut == true) {
    window.location.replace("/logout");
  }

  return (
    <div className="w-screen h-screen flex flex-col">
      <NavBar />
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
}
