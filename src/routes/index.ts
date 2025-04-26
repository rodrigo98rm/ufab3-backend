import { Router } from "express";

import irRouter from "./ir/ir.controller";
import authRoutes from "./auth/auth";

const router = Router();

router.use("/auth", authRoutes);

// router.use("/dashboard");

router.use("/ir", irRouter);

// router.use("/transactions");

export default router;
