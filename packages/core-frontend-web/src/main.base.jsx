import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.base.css";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";

// const options = {
//   api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
//   cross_subdomain_cookie: false,
//   defaults: "2025-05-24",
// };

posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  cookie_domain: window.location.hostname, // pin domain -> no probing
  cross_subdomain_cookie: false, // keep it host-only
});

export function renderApp(AppComponent) {
  const root = document.getElementById("root");

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
        <PostHogProvider client={posthog}>{appContent}</PostHogProvider>
      ) : (
        appContent
      )}
    </StrictMode>
  );
}
