// ─── 🟢 Load .env files early ───────────────────────────────────────────────
import { loadAppAndSharedEnv } from "core-backend-node/utils/loadEnv.js";
loadAppAndSharedEnv(import.meta.url);
// ────────────────────────────────────────────────────────────────────────────

import path from "path";
import url from "url";
import { bootApp } from "core-backend-node/entry.js";
import router from "core-backend-node/routes/routes.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

bootApp({
  dirname: __dirname,
  environment_flag: process.env.ENVIRONMENT_FLAG,
  auth0Config: {
    authRequired: true,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_ID,
  },
  router,
  frontendDir: "admin-frontend-web",
  appLabel: "🔒 ADMIN app",
  envConfig: {
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
    AIRTABLE_KEY_READ_WRITE_VALUE: process.env.AIRTABLE_KEY_READ_WRITE_VALUE,
    AIRTABLE_KEY_READ_ONLY_VALUE: process.env.AIRTABLE_KEY_READ_ONLY_VALUE,
    DEFAULT_AUDIO_REC_ID: process.env.DEFAULT_AUDIO_REC_ID,
    AIRTABLE_KEY_SELECTED: process.env.AIRTABLE_KEY_READ_ONLY_VALUE,
  },
  requireAdminGlobally: true,
});
