import url from "url";
import path from "path";
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
import { bootApp } from "core-backend-node/entry.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

bootApp({
  dirname: __dirname,
  environment_flag,
  auth0Config,
  router,
  frontendDir: "user-frontend-web",
  appLabel: "🙋 USER app",
  envConfig: {
    AIRTABLE_BASE_ID,
    AIRTABLE_KEY_READ_WRITE_VALUE,
    AIRTABLE_KEY_READ_ONLY_VALUE,
    DEFAULT_AUDIO_REC_ID,
    AIRTABLE_KEY_SELECTED,
  },
});
