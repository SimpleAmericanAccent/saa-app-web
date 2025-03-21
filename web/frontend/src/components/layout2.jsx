import NavBar from "@/components/NavBar.jsx";
import { SidebarRight } from "@/components/sidebar-right";
import { Outlet } from "react-router";

export default function Layout2({ children }) {
  return (
    <div className="min-h-screen bg-background w-screen">
      <NavBar />
      <div className="">
        <main className="">
          <Outlet />
        </main>
        {/* <SidebarRight /> */}
      </div>
    </div>
  );
}
