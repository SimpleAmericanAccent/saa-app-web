import path from "path";
import url from "url";
import { environment_flag, auth0Config } from "./config.js";
import router from "shared/backend-node/routes/routes.js";
import { createServer } from "shared/backend-node/server.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 5000;
const isDev = environment_flag === "dev";

const staticPath = path.join(
  __dirname,
  isDev ? "../admin-frontend-web/public" : "../admin-frontend-web/dist"
);
const indexPath = path.join(staticPath, "index.html");

const app = createServer({
  auth0Config,
  router,
  isDev,
  staticPath,
  indexPath,
  devRedirectUrl: "http://localhost:5173",
});

app.listen(port, () => {
  console.log(`Admin backend running on port ${port}`);
});
