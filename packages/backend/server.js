import express from "express";
import pkg from "express-openid-connect";
const { auth, requiresAuth } = pkg;
import rateLimit from "express-rate-limit";
import { requiresAdmin } from "./middleware/requires-admin.js";
import { createAirtableClient } from "./services/airtable.js";
import { setAdminFlag } from "./middleware/set-admin-flag.js";
import { authMiddleware } from "./middleware/auth-middleware.js";
import cors from "cors";

function buildCorsOptions({ envConfig }) {
  const allowedOrigins = [
    envConfig.FRONTEND_URL,
    "https://login.app.simpleamericanaccent.com",
  ];

  const isCloudflarePreviewUrl = (origin) => {
    if (!origin) return false;
    try {
      const url = new URL(origin);
      return url.hostname.endsWith(".saa-app.pages.dev");
    } catch (error) {
      return false;
    }
  };

  return {
    origin(origin, callback) {
      // Allow non-browser clients with no Origin (curl, Postman, health checks)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (isCloudflarePreviewUrl(origin)) {
        return callback(null, true);
      }

      console.warn("Blocked CORS origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // needed for Auth0 cookies
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
}

export function createServer({
  auth0Config,
  router,
  envConfig,
  requireAdminGlobally = false,
}) {
  const app = express();
  const corsOptions = buildCorsOptions({ envConfig });
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
  app.locals.airtable = createAirtableClient({
    baseId: envConfig.AIRTABLE_BASE_ID,
    readKey: envConfig.AIRTABLE_KEY_READ_ONLY_VALUE,
    writeKey: envConfig.AIRTABLE_KEY_READ_WRITE_VALUE,
  });
  const getFrontendUrl = (req) => {
    const origin = req.headers.origin || req.headers.referer;
    if (origin) {
      try {
        const url = new URL(origin);
        if (url.hostname.endsWith(".saa-app.pages.dev")) {
          return origin.endsWith("/") ? origin.slice(0, -1) : origin;
        }
      } catch (error) {
        return envConfig.FRONTEND_URL;
      }
    }
    return envConfig.FRONTEND_URL;
  };

  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions)); // handle preflight everywhere
  app.use(express.json());
  app.use(auth(auth0Config));

  app.use(
    "/api",
    requiresAuth(),
    setAdminFlag,
    limiter,
    authMiddleware(),
    requireAdminGlobally ? requiresAdmin : (req, res, next) => next(),
    router
  );

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.get("/login", loginLimiter, (req, res) => {
    const frontendUrl = getFrontendUrl(req);
    res.oidc.login({ returnTo: frontendUrl });
  });

  app.get("/logout", (req, res) => {
    const frontendUrl = getFrontendUrl(req);
    res.oidc.logout({ returnTo: frontendUrl });
  });

  // catch-all for SPA
  app.all("*", (req, res) => {
    const frontendUrl = getFrontendUrl(req);
    res.type("html").send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Simple American Accent App</title>
          <style>
          :root {
            --background: #ffffff;
            --foreground: #333;
            --primary: #0070f3;
            --secondary: #333;
            --accent: #0070f3;
            --accent-foreground: #0070f3;
          }
            @media (prefers-color-scheme: dark) {
              :root {
                --background: #1a1a1a;
                --foreground: #f5f5f5;
                --primary: #0070f3;
                --secondary: #f5f5f5;
                --accent: #0070f3;
                --accent-foreground: #0070f3;
              }
            }
            @media (prefers-color-scheme: light) {
              :root {
                --background: #ffffff;
                --foreground: #333;
                --primary: #0070f3;
                --secondary: #333;
                --accent: #0070f3;
                --accent-foreground: #0070f3;
              }
            }
            @media (prefers-color-scheme: no-preference) {
              :root {
                --background: #ffffff;
                --foreground: #333;
                --primary: #0070f3;
                --secondary: #333;
                --accent: #0070f3;
                --accent-foreground: #0070f3;
              }
            }

            body {
              font-family: sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              text-align: center;
              background: var(--background);
              color: var(--foreground);
            }
            a {
              margin-top: 12px;
              display: inline-block;
              color: var(--accent-foreground);
              text-decoration: none;
              font-weight: bold;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <h1>Simple American Accent App</h1>
          <p>This is a <em>server</em> for the Simple American Accent App.</p>
          <p><a href="${frontendUrl}">Click here</a> to access the app.</p>
        </body>
      </html>
    `);
  });

  app.use((err, req, res, next) => {
    console.error("Global Server Error:", err);

    if (err.status === 401)
      return res.status(401).json({ error: "Unauthorized" });

    res.status(500).json({ error: "Something went wrong on the server" });
  });

  return app;
}
