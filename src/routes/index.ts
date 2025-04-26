import { Router } from "express";

import irRouter from "./ir/ir.controller";
import uploadRouter from "./parserXlsx/xlsxController";

const router = Router();

// router.use("/auth");

// router.use("/dashboard");

router.use("/ir", irRouter);

router.use("/upload", uploadRouter);
// router.use("/transactions");

export default router;
