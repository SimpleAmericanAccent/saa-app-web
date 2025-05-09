import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.base.css";

export function renderApp(AppComponent) {
  const root = document.getElementById("root");
  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <AppComponent />
      </BrowserRouter>
    </StrictMode>
  );
}
