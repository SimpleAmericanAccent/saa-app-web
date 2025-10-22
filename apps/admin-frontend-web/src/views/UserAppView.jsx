import { Routes } from "react-router-dom";
import coreRoutes from "core-frontend-web/src/routes/coreRoutes.jsx";
import { SidebarLeft } from "core-frontend-web/src/components/sidebar-left";
import { MobileNav } from "core-frontend-web/src/components/mobile-nav";

export default function UserAppView() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <MobileNav />
      <div className="flex flex-1">
        <SidebarLeft />
        <main className="flex-1 transition-all duration-200 pt-[var(--navbar-height)] md:pt-0">
          <Routes>{coreRoutes}</Routes>
        </main>
      </div>
    </div>
  );
}
