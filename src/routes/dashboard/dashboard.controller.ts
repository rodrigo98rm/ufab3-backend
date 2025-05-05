/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response, Router } from "express";

import { prisma } from "../prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  // Proventos por ativo
  const userId = req.user?.userId;

  const transactions = await prisma.transaction.groupBy({
    _sum: {
      totalValue: true,
    },
    by: ["assetId"],
    where: {
      type: "Rendimento",
      userId,
    },
  });

  const assets = await prisma.asset.findMany({
    select: {
      category: true,
      id: true,
      name: true,
      ticker: true,
    },
    where: {
      id: {
        in: transactions.map((transaction) => transaction.assetId),
      },
    },
  });
  const earningsWithAssets = transactions.map((transaction) => {
    const asset = assets.find((asset) => asset.id === transaction.assetId);
    return {
      ...transaction,
      asset: {
        category: asset?.category,
        id: asset?.id,
        name: asset?.name,
        ticker: asset?.ticker,
      },
    };
  });

  res.send({
    earnings: earningsWithAssets,
  });
  return;
});

export default router;
