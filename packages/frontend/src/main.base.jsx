import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.base.css";
import { PostHogProvider } from "posthog-js/react";

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  defaults: "2025-05-24",
};

export function renderApp(AppComponent) {
  const root = document.getElementById("root");

  // Remove the initial loading screen once React mounts
  const initialLoading = document.getElementById("initial-loading");
  if (initialLoading) {
    // Add fade-out effect before removing
    initialLoading.style.transition = "opacity 0.3s ease-out";
    initialLoading.style.opacity = "0";
    setTimeout(() => {
      initialLoading.remove();
    }, 300);
  }

  // Check if PostHog is properly configured
  const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
  const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;

  // Use Vite's built-in mode detection instead of custom environment flag
  const isProduction = import.meta.env.PROD;

  // Only enable PostHog in production
  if (!isProduction) {
    console.log(`🧪 ${import.meta.env.MODE} mode - PostHog disabled`);
  } else if (!posthogKey || !posthogHost) {
    console.warn(
      "⚠️ PostHog not properly configured. Missing environment variables."
    );
  }

  const appContent = (
    <BrowserRouter>
      <AppComponent />
    </BrowserRouter>
  );

  createRoot(root).render(
    <StrictMode>
      {isProduction && posthogKey && posthogHost ? (
        <PostHogProvider apiKey={posthogKey} options={options}>
          {appContent}
        </PostHogProvider>
      ) : (
        appContent
      )}
    </StrictMode>
  );
}
