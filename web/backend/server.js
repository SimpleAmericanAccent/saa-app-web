import http from "http";
// import https from "https";
import url from "url";
import path from "path";
import express from "express";
import pkg from "express-openid-connect";
const { auth, requiresAuth } = pkg;
import createRoutes from "./routes/routes.js";
import { environment_flag } from "./config.js"; // Assume environment variables are imported here
import { PrismaClient } from "@prisma/client";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Add Prisma cleanup handler
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

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

// Enable authentication & apply global authentication
app.use(auth(config));
app.use(requiresAuth());

app.use(function (req, res, next) {
  app.locals.user = req.oidc.user;
  next();
});

const staticPath =
  environment_flag === "dev" ? "../frontend/public" : "../frontend/dist";

app.use(express.static(staticPath, { index: "home.html" }));

app.use(express.json());

app.use(createRoutes(app));

app.use((err, req, res, next) => {
  console.error("Global Server Error:", err);
  res.status(500).json({ error: "Something went wrong on the serve" });
});

http.createServer(app).listen(port, () => {
  console.log(`Server running on port ${port}`);
});
