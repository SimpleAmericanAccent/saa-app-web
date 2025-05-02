import path from "path";
import url from "url";
import express from "express";
import { auth } from "express-openid-connect";
import { environment_flag, auth0Config } from "./config.js";
import router from "./routes/routes.js";

//#region main server setup
// setup
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 5000;
const isDev = environment_flag === "dev";

// initialize express app
const app = express();
app.use(express.json());
app.use(auth(auth0Config));
app.use(router);
//#endregion setup

//#region frontend
// static files
const staticPath = path.join(
  __dirname,
  isDev ? "../admin-frontend-web/public" : "../admin-frontend-web/dist"
);
const indexPath = path.join(staticPath, "index.html");
app.use(express.static(staticPath));

// Handle root GET after login
app.get("/", (req, res) =>
  isDev ? res.redirect("http://localhost:5173/") : res.sendFile(indexPath)
);
// catch-all for SPA
app.get("*", (req, res) =>
  isDev
    ? res
        .status(404)
        .send("SPA frontend is running separately at http://localhost:5173")
    : res.sendFile(indexPath)
);
//#endregion frontend

//#region global error handler & server listener
app.use((err, req, res, next) => {
  console.error("Global Server Error:", err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
//#endregion global error handler & server listener
