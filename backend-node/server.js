import path from "path";
import url from "url";
import express from "express";
import { auth } from "express-openid-connect";
import createRoutes from "./routes/routes.js";
import { environment_flag } from "./config.js"; // Assume environment variables are imported here

// setup
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 5000;
const isDev = environment_flag === "dev";

// initialize express app
const app = express();

// general middleware
app.use(express.json());

//#region auth
const config = {
  authRequired: true,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_ID,
};
app.use(auth(config));
//#endregion auth

//#region api
app.use(createRoutes());
//#endregion api

//#region frontend
// static files
const staticPath = path.join(
  __dirname,
  isDev ? "../frontend-web/public" : "../frontend-web/dist"
);
const indexPath = path.join(staticPath, "index.html");
app.use(express.static(staticPath));

// Handle root GET after login
app.get("/", (req, res) => {
  if (isDev) {
    res.redirect("http://localhost:5173/");
    return;
  }
  res.sendFile(indexPath);
});

// catch-all for SPA
app.get("*", (req, res) => {
  if (isDev) {
    res
      .status(404)
      .send("SPA frontend is running separately at http://localhost:5173");
    return;
  }
  res.sendFile(indexPath);
});
//#endregion frontend

app.use((err, req, res, next) => {
  console.error("Global Server Error:", err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
