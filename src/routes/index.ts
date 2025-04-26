import { Router } from "express";

import irRouter from "./ir/ir.controller";

const router = Router();

// router.use("/auth");

// router.use("/dashboard");

router.use("/ir", irRouter);

// router.use("/transactions");

export default router;
