import { defineConfig } from "vite";
import { getBaseConfig, makeLogOnce } from "core-frontend-web/vite.base";

export default defineConfig({
  ...getBaseConfig(),
  plugins: [
    ...(getBaseConfig().plugins || []),
    {
      name: "custom-vite-startup-logs",
      configureServer(server) {
        makeLogOnce("🙋 USER app...")(server);
      },
    },
  ],
});
