import * as React from "react";
import { SidebarTrigger } from "core-frontend-web/src/components/ui/sidebar";
import { ModeToggle } from "./mode-toggle";
import useAuthStore from "core-frontend-web/src/stores/authStore";
import { Menu, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export function MobileNav() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we can go back (not on the root path)
  const canGoBack =
    location.pathname !== "/" && location.pathname !== "/dashboard";

  // Check if we can go forward (if there's forward history)
  const [canGoForward, setCanGoForward] = React.useState(false);

  React.useEffect(() => {
    // Check if there's forward history available
    const checkForwardHistory = () => {
      // This is a simple check - in a real app you might want to track history more precisely
      setCanGoForward(window.history.length > 1);
    };

    checkForwardHistory();
    // Listen for popstate events to update forward availability
    window.addEventListener("popstate", checkForwardHistory);
    return () => window.removeEventListener("popstate", checkForwardHistory);
  }, [location]);

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1);
    }
  };

  const handleForward = () => {
    if (canGoForward) {
      navigate(1);
    }
  };

  return (
    <nav className="md:hidden min-h-[var(--navbar-height)] max-h-[var(--navbar-height)] fixed bg-background top-0 left-0 right-0 border-b z-50 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-8 w-8 p-1">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
        {canGoBack && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center h-8 w-8 p-1 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        {canGoForward && (
          <button
            onClick={handleForward}
            className="flex items-center justify-center h-8 w-8 p-1 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors cursor-pointer"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={logout}
          className="flex items-center gap-1 px-2 py-1 text-xs text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors cursor-pointer"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}
