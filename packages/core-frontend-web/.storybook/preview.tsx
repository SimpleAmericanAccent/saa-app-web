import type { Preview } from "@storybook/react-vite";
import "../src/index.base.css";
import { ThemeProvider } from "../src/components/theme-provider";
import React from "react";

const preview: Preview = {
  decorators: [
    (Story, context) => {
      // Get theme from Storybook's global toolbar
      const storybookTheme = context.globals.theme || "system";
      return (
        <ThemeProvider
          key={storybookTheme} // Force re-render when theme changes
          defaultTheme={storybookTheme}
          storageKey="storybook-theme"
        >
          <Story />
        </ThemeProvider>
      );
    },
  ],
  globalTypes: {
    theme: {
      description: "Global theme for components",
      defaultValue: "system",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
          { value: "system", title: "System", icon: "desktop" },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    // Add Vitest parameters
    test: {
      // Configure test environment
      environment: "jsdom",
      // Add any test setup here
    },
  },
};

export default preview;
