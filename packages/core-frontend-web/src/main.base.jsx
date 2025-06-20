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
  createRoot(root).render(
    <StrictMode>
      <PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
        options={options}
      >
        <BrowserRouter>
          <AppComponent />
        </BrowserRouter>
      </PostHogProvider>
    </StrictMode>
  );
}
