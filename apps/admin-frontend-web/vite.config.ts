import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";

const logOnce = (server: ViteDevServer) => {
  if ((globalThis as { __VITE_LOGGED_ONCE__?: boolean }).__VITE_LOGGED_ONCE__) {
    return;
  }
  (globalThis as { __VITE_LOGGED_ONCE__?: boolean }).__VITE_LOGGED_ONCE__ =
    true;

  setTimeout(
    () =>
      console.log(
        "\n" +
          unindent(
            `Started VITE server on port ${server.config.server.port} for:
                🧪 DEV
                💻 FRONTEND-WEB
                🔒 ADMIN app...`
          ) +
          "\n"
      ),
    100
  );
};

const unindent = (str: string) =>
  str
    .split("\n")
    .map((line) => line.replace(/^\s+/, "")) // removes leading tabs or spaces
    .join("\n\t")
    .trim();

// https://vite.dev/config/
export default defineConfig({
  clearScreen: false,
  logLevel: "warn",
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        providerImportSource: "@mdx-js/react",
      }),
    },
    react(),
    tailwindcss(),
    {
      name: "custom-vite-startup-logs",
      configureServer(server) {
        server.httpServer?.once("listening", () => {
          logOnce(server);
        });
      },
    },
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
      "core-frontend-web": path.resolve(
        __dirname,
        "../../packages/core-frontend-web"
      ),
    },
  },
});
