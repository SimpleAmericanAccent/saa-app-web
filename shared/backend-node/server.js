import express from "express";
import { auth } from "express-openid-connect";

export function createServer({
  auth0Config,
  router,
  isDev,
  staticPath,
  indexPath,
  devRedirectUrl,
}) {
  const app = express();
  app.use(express.json());
  app.use(auth(auth0Config));
  app.use(router);

  app.use(express.static(staticPath));

  app.get("/", (req, res) =>
    isDev ? res.redirect(devRedirectUrl) : res.sendFile(indexPath)
  );

  app.get("/callback", (req, res) =>
    isDev ? res.redirect(devRedirectUrl) : res.sendFile(indexPath)
  );
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
