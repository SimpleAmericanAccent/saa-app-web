import fs from "fs";
import https from "https";
import { createServer } from "./server.js";

/**
 * Starts an Express server with optional HTTPS for development.
 * Call this in each app with app-specific config.
 */
export function bootApp({
  router,
  environment_flag,
  auth0Config,
  envConfig,
  requireAdminGlobally = false,
  preSetup = null,
}) {
  const isDev = environment_flag === "dev";
  const port = 5000;

  const app = createServer({
    auth0Config,
    router,
    envConfig,
    requireAdminGlobally,
  });

  if (preSetup) preSetup(app);

  if (isDev) {
    const key = fs.readFileSync("../../localhost-key.pem");
    const cert = fs.readFileSync("../../localhost.pem");
    https.createServer({ key, cert }, app).listen(port, () => {});
  } else {
    app.listen(port, () => {});
  }
  console.log(`\nStarted Express server`);
}
