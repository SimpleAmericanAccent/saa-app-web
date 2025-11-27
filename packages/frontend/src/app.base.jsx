import { ThemeProvider } from "frontend/src/components/theme-provider";
import { SidebarProvider } from "frontend/src/components/ui/sidebar";
import { Routes } from "react-router-dom";
import { PWAInstallPrompt } from "frontend/src/components/pwa-install-prompt";
import DataInitializer from "frontend/src/components/data-initializer";

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
        <DataInitializer />
        <LayoutWrapper>
          <Routes>{children}</Routes>
        </LayoutWrapper>
        <PWAInstallPrompt />
      </SidebarProvider>
    </ThemeProvider>
  );
}
