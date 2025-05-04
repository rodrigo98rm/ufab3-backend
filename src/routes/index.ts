import { Router } from "express";

import { authMiddleware } from "../middlewares/auth";
import authRoutes from "./auth/auth";
import irRouter from "./ir/ir.controller";
import uploadRouter from "./parserXlsx/xlsxController";

const router = Router();

router.use("/auth", authRoutes);

// router.use("/dashboard");

router.use("/ir", authMiddleware, irRouter);

router.use("/upload", authMiddleware, uploadRouter);

export default router;
