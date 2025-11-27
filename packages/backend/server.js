import express from "express";
import { auth } from "express-openid-connect";
import rateLimit from "express-rate-limit";
import { requiresAdmin } from "./middleware/requires-admin.js";
import { createAirtableClient } from "./services/airtable.js";
import { setAdminFlag } from "./middleware/set-admin-flag.js";
import { authMiddleware } from "./middleware/auth-middleware.js";

export function createServer({
  auth0Config,
  router,
  isDev,
  staticPath,
  indexPath,
  devRedirectUrl = "https://localhost:5173",
  envConfig,
  requireAdminGlobally = false,
}) {
  const app = express();

  app.use(express.json());
  app.use(auth(auth0Config));
  app.use(setAdminFlag);

  // Rate limiting middleware - applies to all routes except admin users
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 900, // limit each IP to 900 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for admin users
      return req.isAdmin === true;
    },
  });

  app.use(limiter);

  // Apply JIT user provisioning middleware globally
  app.use(authMiddleware());

  if (requireAdminGlobally) app.use(requiresAdmin);

  app.locals.env = envConfig;
  app.locals.airtable = createAirtableClient({
    baseId: envConfig.AIRTABLE_BASE_ID,
    readKey: envConfig.AIRTABLE_KEY_READ_ONLY_VALUE,
    writeKey: envConfig.AIRTABLE_KEY_READ_WRITE_VALUE,
  });

  app.get("/", (req, res) =>
    isDev ? res.redirect(devRedirectUrl) : res.sendFile(indexPath)
  );

  app.get("/callback", (req, res) =>
    isDev ? res.redirect(devRedirectUrl) : res.sendFile(indexPath)
  );

  app.use(router);

  app.use(express.static(staticPath));

  // catch-all for SPA
  app.get("*", (req, res) =>
    isDev
      ? res
          .status(404)
          .send(`SPA frontend is running separately at ${devRedirectUrl}`)
      : res.sendFile(indexPath)
  );

  app.use((err, req, res, next) => {
    console.error("Global Server Error:", err);
    res.status(500).json({ error: "Something went wrong on the server" });
  });

  return app;
}
