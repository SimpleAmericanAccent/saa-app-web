import express from "express";
import { auth } from "express-openid-connect";
import { createAirtableClient } from "./services/airtable.js";

export function createServer({
  auth0Config,
  router,
  isDev,
  staticPath,
  indexPath,
  devRedirectUrl = "https://localhost:5173",
  envConfig,
}) {
  const app = express();

  app.use(express.json());
  app.use(auth(auth0Config));

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
