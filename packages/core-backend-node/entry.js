import path from "path";
import url from "url";
import fs from "fs";
import https from "https";
import { createServer } from "./server.js";

/**
 * Starts an Express server with optional HTTPS for development.
 * Call this in each app with app-specific config.
 */
export function bootApp({
  dirname,
  router,
  environment_flag,
  auth0Config,
  envConfig,
  frontendDir,
  appLabel,
}) {
  const __dirname = dirname;
  const isDev = environment_flag === "dev";
  const port = process.env.PORT || 5000;

  const staticPath = path.join(
    __dirname,
    isDev ? `../${frontendDir}/` : `../${frontendDir}/dist`
  );
  const indexPath = path.join(staticPath, "index.html");

  const app = createServer({
    auth0Config,
    router,
    isDev,
    staticPath,
    indexPath,
    envConfig,
  });

  if (isDev) {
    const cert = fs.readFileSync("../../localhost.pem");
    const key = fs.readFileSync("../../localhost-key.pem");

    https.createServer({ key, cert }, app).listen(port, () => {
      console.log(
        `\nStarted HTTPS Express server on port ${port} for:\n` +
          `  🧪 DEV\n  ⚙️  BACKEND-NODE\n  ${appLabel}`
      );
    });
  } else {
    app.listen(port, () => {
      console.log(
        `\nStarted Express server on port ${port} for:\n` +
          `  🚀 PROD\n  ⚙️  BACKEND-NODE\n  ${appLabel}`
      );
    });
  }
}
