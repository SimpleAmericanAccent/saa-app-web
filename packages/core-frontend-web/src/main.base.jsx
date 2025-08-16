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

  // Check if PostHog is properly configured
  const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
  const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;
  const environmentFlag = import.meta.env.VITE_ENVIRONMENT_FLAG || "dev";

  // Only enable PostHog in production
  const isProduction =
    environmentFlag === "prod" || environmentFlag === "production";

  if (!isProduction) {
    console.log(`🧪 ${environmentFlag} mode - PostHog disabled`);
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
