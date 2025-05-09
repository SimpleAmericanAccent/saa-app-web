import NavBar from "core-frontend-web/src/components/NavBar.jsx";
import { SidebarRight } from "core-frontend-web/src/components/sidebar-right";
import { Outlet } from "react-router";
import useAuthStore from "core-frontend-web/src/stores/authStore";
import { useEffect } from "react";

export default function Layout1({ children }) {
  const { isLoggedOut } = useAuthStore();

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
