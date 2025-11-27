import express from "express";

import baseRouter from "./base-router.js";
import wiktionaryRouter from "./wiktionary-router.js";
import orthoRouter from "./ortho-router.js";
import quizRouter from "./quiz-router.js";
import adminRouter from "./admin-router.js";
import { wrapMethodsWithSafeRoute } from "../middleware/safe-route.js";

const router = express.Router();

wrapMethodsWithSafeRoute(router);
router.use("/api", baseRouter);
router.use("/api/wiktionary", wiktionaryRouter);
router.use("/api/ortho", orthoRouter);
router.use("/api/quiz", quizRouter);
router.use("/api/admin", adminRouter);

export default router;
