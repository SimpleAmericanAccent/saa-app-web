import express from "express";

import v1Router from "./v1Router.js";
import v2Router from "./v2Router.js";
import baseRouter from "./baseRouter.js";
import prismaRouter from "./prismaRouter.js";
import { wrapMethodsWithSafeRoute } from "../middleware/safeRoute.js";

const router = express.Router();

wrapMethodsWithSafeRoute(router);

router.use("/", baseRouter);
router.use("/v1", v1Router);
router.use("/v2", v2Router);
router.use("/prisma", prismaRouter);

export default router;
