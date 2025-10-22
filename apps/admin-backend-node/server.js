// ─── 🟢 Load .env files early ───────────────────────────────────────────────
import { loadAppAndSharedEnv } from "core-backend-node/utils/load-env.js";
loadAppAndSharedEnv(import.meta.url);
// ────────────────────────────────────────────────────────────────────────────

import path from "path";
import url from "url";
import { bootApp } from "core-backend-node/entry.js";
import router from "core-backend-node/routes/routes.js";
import express from "express";
import internalStatsRouter from "./routes/internal-stats-router.js";
import { createAirtableClient } from "core-backend-node/services/airtable.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const adminRouter = express
  .Router()
  .use(router)
  .use("/api/internalstats", internalStatsRouter);

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
  router: adminRouter,
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
  preSetup: (app) => {
    app.locals.airtableOps = createAirtableClient({
      baseId: process.env.AIRTABLE_OPS_BASE_ID,
      readKey: process.env.AIRTABLE_OPS_KEY_READ_WRITE_VALUE,
      writeKey: process.env.AIRTABLE_OPS_KEY_READ_WRITE_VALUE,
    });
  },
});
