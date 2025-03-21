import NavBar from "@/components/navbar/NavBar.jsx";
import { SidebarRight } from "@/components/sidebar-right";
import { Outlet } from "react-router";

export default function Layout1({ children }) {
  return (
    <div className="w-screen">
      <NavBar showSidebarTrigger="true" />
      <div className="flex">
        <main className="flex1">
          <Outlet />
        </main>
        <SidebarRight className="" />
      </div>
    </div>
  );
}
