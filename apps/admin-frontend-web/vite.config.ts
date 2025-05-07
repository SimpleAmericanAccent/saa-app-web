import path from "path";
import fs from "fs";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";

const isDev = process.env.NODE_ENV === "development";
const backendTarget = "https://localhost:5000";

// Reusable proxy config generator
const makeProxyEntry = (path: string) => ({
  [path]: {
    target: backendTarget,
    changeOrigin: true,
    secure: false, // only needed for self-signed certs in dev
  },
});

// List all your paths here
const proxyPaths = [
  "/logout",
  "/callback",
  "/api",
  "/authz",
  "/data",
  "/authnew",
  "/v1",
  "/prisma",
  "/v2",
];

// Merge all entries into one object
const proxy = Object.assign({}, ...proxyPaths.map(makeProxyEntry));

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
            `Started VITE server at ${
              isDev ? "https://localhost" : "http://localhost"
            }:${server.config.server.port} for:
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
    https: isDev
      ? {
          key: fs.readFileSync(
            path.resolve(__dirname, "../../localhost-key.pem")
          ),
          cert: fs.readFileSync(path.resolve(__dirname, "../../localhost.pem")),
        }
      : false,
    port: 5173,
    proxy,
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
