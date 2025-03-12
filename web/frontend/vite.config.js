import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
  },
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
    },
  },
});
