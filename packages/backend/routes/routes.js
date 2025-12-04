import express from "express";

import baseRouter from "./base-router.js";
import wiktionaryRouter from "./wiktionary-router.js";
import orthoRouter from "./ortho-router.js";
import quizRouter from "./quiz-router.js";
import adminRouter from "./admin-router.js";
import { wrapMethodsWithSafeRoute } from "../middleware/safe-route.js";

const router = express.Router();

wrapMethodsWithSafeRoute(router);
router.use("/", baseRouter);
router.use("/wiktionary", wiktionaryRouter);
router.use("/ortho", orthoRouter);
router.use("/quiz", quizRouter);
router.use("/admin", adminRouter);

export default router;
