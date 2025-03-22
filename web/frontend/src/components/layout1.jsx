import NavBar from "@/components/NavBar.jsx";
import { SidebarRight } from "@/components/sidebar-right";
import { Outlet } from "react-router";

export default function Layout1({ children }) {
  return (
    <div className="w-screen h-screen flex flex-col">
      <NavBar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
