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

  // Simple forward/back tracking
  const [canGoForward, setCanGoForward] = React.useState(false);
  const [hasNavigatedBack, setHasNavigatedBack] = React.useState(false);

  React.useEffect(() => {
    // Reset forward availability when navigating to a new page
    if (!hasNavigatedBack) {
      setCanGoForward(false);
    }
  }, [location.pathname, hasNavigatedBack]);

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1);
      setHasNavigatedBack(true);
      setCanGoForward(true);
    }
  };

  const handleForward = () => {
    if (canGoForward) {
      navigate(1);
      setHasNavigatedBack(false);
      setCanGoForward(false);
    }
  };

  return (
    <nav className="md:hidden min-h-[var(--navbar-height)] max-h-[var(--navbar-height)] fixed bg-background top-0 left-0 right-0 border-b z-50 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-8 w-8 p-1">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
        <button
          onClick={handleBack}
          disabled={!canGoBack}
          className={`flex items-center justify-center h-8 w-8 p-1 rounded-md transition-colors ${
            canGoBack
              ? "text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
              : "text-muted-foreground cursor-not-allowed opacity-50"
          }`}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={handleForward}
          disabled={!canGoForward}
          className={`flex items-center justify-center h-8 w-8 p-1 rounded-md transition-colors ${
            canGoForward
              ? "text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
              : "text-muted-foreground cursor-not-allowed opacity-50"
          }`}
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
}
