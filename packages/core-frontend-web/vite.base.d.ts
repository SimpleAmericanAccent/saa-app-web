declare module "core-frontend-web/vite.base" {
  import type { UserConfig, ViteDevServer } from "vite";

  export function getBaseConfig(): UserConfig;
  export function makeLogOnce(label: string): (server: ViteDevServer) => void;
}
