import http from "http";
// import https from "https";
import url from "url";
import path from "path";
import express from "express";
import pkg from "express-openid-connect";
const { auth, requiresAuth } = pkg;
import createRoutes from "./routes/routes.js";
import { environment_flag } from "./config.js"; // Assume environment variables are imported here

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 5000;
let currentUserAudioAccess;

const config = {
  authRequired: true,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_ID,
};

const app = express();

// Configuration & environment
// Express app creation
// Initialize services
// Initialize controllers
// Auth middleware
// Routes
// Error handling

app.use(auth(config));

app.use(requiresAuth());

app.use(function (req, res, next) {
  app.locals.user = req.oidc.user;
  next();
});

if (environment_flag === "deva") {
  app.use(express.static("../frontend/public", { index: "home.html" }));
} else {
  app.use(express.static("../frontend/dist", { index: "home.html" }));
}

app.use(createRoutes(app));

http.createServer(app).listen(port, () => {
  console.log(`Server running on port ${port}`);
});
