const path = require("path");

/** @type {import('@storybook/react-vite').StorybookConfig} */
const config = {
  stories: [
    "../src/stories/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    // Try to use the Vite plugin with dynamic import
    try {
      const { default: tailwindcss } = await import("@tailwindcss/vite");
      config.plugins = config.plugins || [];
      config.plugins.push(tailwindcss());
    } catch (error) {
      console.warn("Could not load Tailwind Vite plugin:", error.message);
      // Fallback: just continue without Tailwind for now
    }

    // Keep your existing manual setup
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "../src"),
      frontend: path.resolve(__dirname, ".."),
    };

    config.esbuild = config.esbuild || {};
    config.esbuild.jsx = "automatic";

    return config;
  },
};

module.exports = config;
