import express from "express";

import v1Router from "./v1Router.js";
import v2Router from "./v2Router.js";
import baseRouter from "./baseRouter.js";
import prismaRouter from "./prismaRouter.js";
import dictionaryRouter from "./dictionaryRouter.js";
import orthoRouter from "./orthoRouter.js";
import quizRouter from "./quizRouter.js";
import adminRouter from "./adminRouter.js";
import { wrapMethodsWithSafeRoute } from "../middleware/safeRoute.js";

const router = express.Router();

wrapMethodsWithSafeRoute(router);
router.use("/", baseRouter);
router.use("/v1", v1Router);
router.use("/v2", v2Router);
router.use("/prisma", prismaRouter);
router.use("/api/dictionary", dictionaryRouter);
router.use("/api/ortho", orthoRouter);
router.use("/api/quiz", quizRouter);
router.use("/api/admin", adminRouter);

export default router;
