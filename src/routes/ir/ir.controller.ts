import { Router } from "express";

import { prisma } from "../prisma";

const router = Router();

router.get("/", async (req, res) => {
  const result = await prisma.transaction.findMany();

  res.status(200).json({
    transactions: result,
  });
});

export default router;
