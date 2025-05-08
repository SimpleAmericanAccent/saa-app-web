import path from "path";
import url from "url";
import fs from "fs";
import https from "https";
import {
  environment_flag,
  auth0Config,
  AIRTABLE_BASE_ID,
  AIRTABLE_KEY_READ_WRITE_VALUE,
  AIRTABLE_KEY_READ_ONLY_VALUE,
  DEFAULT_AUDIO_REC_ID,
  AIRTABLE_KEY_SELECTED,
} from "./config.js";
import router from "core-backend-node/routes/routes.js";
import { createServer } from "core-backend-node/server.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 5000;
const isDev = environment_flag === "dev";

const staticPath = path.join(
  __dirname,
  isDev ? "../user-frontend-web/" : "../user-frontend-web/dist"
);
const indexPath = path.join(staticPath, "index.html");

const app = createServer({
  auth0Config,
  router,
  isDev,
  staticPath,
  indexPath,
  envConfig: {
    AIRTABLE_BASE_ID,
    AIRTABLE_KEY_READ_WRITE_VALUE,
    AIRTABLE_KEY_READ_ONLY_VALUE,
    DEFAULT_AUDIO_REC_ID,
    AIRTABLE_KEY_SELECTED,
  },
});

if (isDev) {
  const cert = fs.readFileSync("../../localhost.pem");
  const key = fs.readFileSync("../../localhost-key.pem");

  https.createServer({ key, cert }, app).listen(port, () => {
    console.log(
      `\nStarted HTTPS Express server on port ${port} for:
  ${isDev ? "🧪 DEV" : "🚀 PROD"}
  ${isDev ? "⚙️  BACKEND-NODE" : "⚙️ BACKEND-NODE"}
  🙋 USER app`
    );
  });
} else {
  app.listen(port, () => {
    console.log(
      `\nStarted Express server on port ${port} for:
    ${isDev ? "🧪 DEV" : "🚀 PROD"}
    ${isDev ? "⚙️  BACKEND-NODE" : "⚙️ BACKEND-NODE"}
    🙋 USER app`
    );
  });
}
