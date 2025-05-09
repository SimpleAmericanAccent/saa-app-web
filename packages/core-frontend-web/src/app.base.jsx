import { ThemeProvider } from "core-frontend-web/src/components/theme-provider";
import { SidebarProvider } from "core-frontend-web/src/components/ui/sidebar";
// import Layout1 from "core-frontend-web/src/components/layout1.jsx";
import { Routes, Route } from "react-router-dom";
import Transcript from "core-frontend-web/src/pages/transcript.jsx";
import coreRoutes from "core-frontend-web/src/routes/coreRoutes.jsx";

export default function AppBase({
  children,
  layout: LayoutWrapper = React.Fragment,
}) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider
        style={{
          "--sidebar-width": "var(--rsidebar-width)",
        }}
      >
        <LayoutWrapper>
          <Routes>
            {/* Shared routes */}
            {coreRoutes}
            {/* Custom routes from extending app */}
            {children}
            <Route path="*" element={<Transcript />} />
          </Routes>
        </LayoutWrapper>
      </SidebarProvider>
    </ThemeProvider>
  );
}
