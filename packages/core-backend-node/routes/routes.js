import express from "express";

import baseRouter from "./baseRouter.js";
import prismaRouter from "./prismaRouter.js";
import dictionaryRouter from "./dictionaryRouter.js";
import orthoRouter from "./orthoRouter.js";
import quizRouter from "./quizRouter.js";
import adminRouter from "./adminRouter.js";
import { wrapMethodsWithSafeRoute } from "../middleware/safeRoute.js";

const router = express.Router();

wrapMethodsWithSafeRoute(router);
router.use("/api", baseRouter);
router.use("/prisma", prismaRouter);
router.use("/api/dictionary", dictionaryRouter);
router.use("/api/ortho", orthoRouter);
router.use("/api/quiz", quizRouter);
router.use("/api/admin", adminRouter);

export default router;
