import path from "path";
import fs from "fs";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import { fileURLToPath } from "url";
import { loadEnv } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const env = loadEnv(process.env.NODE_ENV, path.resolve(__dirname, "../../"));

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
    console.log("\n" + unindent(`Started Vite server`) + "\n");
    console.log("env", env);
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
  envDir: path.resolve(__dirname, "../../"),
  server:
    process.env.NODE_ENV === "development"
      ? {
          https: {
            key: fs.readFileSync(
              path.resolve(__dirname, "../../../../localhost-key.pem")
            ),
            cert: fs.readFileSync(
              path.resolve(__dirname, "../../../../localhost.pem")
            ),
          },
          open: true, // Open backend URL when dev server starts
        }
      : {},
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../../src"),
      frontend: path.resolve(__dirname, "../../"),
    },
  },
});
