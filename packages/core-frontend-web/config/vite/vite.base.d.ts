declare module "core-frontend-web/config/vite/vite.base" {
  import type { UserConfig, ViteDevServer } from "vite";

  export function getBaseConfig(): UserConfig;
  export function makeLogOnce(label: string): (server: ViteDevServer) => void;
}
