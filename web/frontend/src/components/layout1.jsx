import NavBar from "@/components/NavBar.jsx";
import { SidebarRight } from "@/components/sidebar-right";
import { Outlet } from "react-router";

export default function Layout1({ children }) {
  return (
    <div className="w-screen h-screen flex flex-col">
      <NavBar showSidebarTrigger="true" />
      <div className="flex flex1">
        <main className="flex1">
          <Outlet />
        </main>
        <SidebarRight className="h-full" />
      </div>
    </div>
  );
}
