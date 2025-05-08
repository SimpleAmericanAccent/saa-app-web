import path from "path";
import fs from "fs";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === "development";
const backendTarget = "https://localhost:5000";

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

const makeProxyEntry = (path) => ({
  [path]: {
    target: backendTarget,
    changeOrigin: true,
    secure: false,
  },
});

const proxy = Object.assign({}, ...proxyPaths.map(makeProxyEntry));

const unindent = (str) =>
  str
    .split("\n")
    .map((line) => line.replace(/^\s+/, ""))
    .join("\n\t")
    .trim();

export const makeLogOnce = (label) => (server) => {
  if (globalThis.__VITE_LOGGED_ONCE__) return;
  globalThis.__VITE_LOGGED_ONCE__ = true;

  setTimeout(() => {
    console.log(
      "\n" +
        unindent(
          `Started VITE server at ${
            isDev ? "https://localhost" : "http://localhost"
          }:${server.config.server.port} for:
              🧪 DEV
              💻 FRONTEND-WEB
              ${label}`
        ) +
        "\n"
    );
  }, 100);
};

export const basePlugins = [
  {
    enforce: "pre",
    ...mdx({
      providerImportSource: "@mdx-js/react",
    }),
  },
  react(),
  tailwindcss(),
];

export const getBaseConfig = () => ({
  clearScreen: false,
  logLevel: "warn",
  plugins: basePlugins,
  server: {
    https: isDev
      ? {
          key: fs.readFileSync(
            path.resolve(__dirname, "../../localhost-key.pem")
          ),
          cert: fs.readFileSync(path.resolve(__dirname, "../../localhost.pem")),
        }
      : undefined,
    port: 5173,
    proxy,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../../src"),
      "core-frontend-web": path.resolve(__dirname, "../../"),
    },
  },
});
