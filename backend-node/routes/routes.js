import express from "express";

import v1Router from "./v1Router.js";
import v2Router from "./v2Router.js";
import baseRouter from "./baseRouter.js";
import prismaRouter from "./prismaRouter.js";

const router = express.Router();

//#region Wraps any async route in a try-catch, preventing server crashes
function safeRoute(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      console.error("❌ Uncaught Route Error:", err);
      next(err); // Pass error to Express global error handler
    }
  };
}

// ✅ Override `router.get`, `router.post`, etc. to always apply `safeRoute`
const methods = ["get", "post", "put", "patch", "delete", "all"];
methods.forEach((method) => {
  const original = router[method];
  router[method] = function (path, ...handlers) {
    // Wrap every handler inside `safeRoute`
    original.call(router, path, ...handlers.map(safeRoute));
  };
});
//#endregion wrap all routes in try-catch

router.use("/", baseRouter);
router.use("/v1", v1Router);
router.use("/v2", v2Router);
router.use("/prisma", prismaRouter);

export default router;
