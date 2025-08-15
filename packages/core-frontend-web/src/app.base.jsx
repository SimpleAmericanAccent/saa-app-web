import { ThemeProvider } from "core-frontend-web/src/components/theme-provider";
import { SidebarProvider } from "core-frontend-web/src/components/ui/sidebar";
import { Routes } from "react-router-dom";
import { PWAInstallPrompt } from "core-frontend-web/src/components/PWAInstallPrompt";

export default function AppBase({
  children,
  layout: LayoutWrapper = React.Fragment,
}) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider
        style={{
          "--sidebar-width": "var(--lsidebar-width)",
        }}
      >
        <LayoutWrapper>
          <Routes>{children}</Routes>
        </LayoutWrapper>
        <PWAInstallPrompt />
      </SidebarProvider>
    </ThemeProvider>
  );
}
