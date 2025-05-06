import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        providerImportSource: "@mdx-js/react",
      }),
    },
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      "/logout": "http://localhost:5000",
      "/callback": "http://localhost:5000",
      "/api": "http://localhost:5000",
      "/authz": "http://localhost:5000",
      "/data": "http://localhost:5000",
      "/authnew": "http://localhost:5000",
      "/v1": "http://localhost:5000",
      "/prisma": "http://localhost:5000",
      "/v2": "http://localhost:5000",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "frontend-web-core": path.resolve(
        __dirname,
        "../../packages/frontend-web-core"
      ),
    },
  },
});
