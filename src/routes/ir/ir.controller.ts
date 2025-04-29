/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { Request, Response, Router } from "express";

import { Prisma } from "../../../generated/prisma";
import { prisma } from "../prisma";

const router = Router();

const assetSelect = {
  category: true,
  name: true,
  ticker: true,
} satisfies Prisma.AssetSelect;

type Asset = Prisma.AssetGetPayload<{ select: typeof assetSelect }>;

router.get("/", async (req: Request, res: Response) => {
  const userId = 1; // TODO: get userId from request

  const result = await prisma.transaction.findMany({
    distinct: ["assetId"],
    select: {
      asset: true,
    },
    where: {
      asset: {
        category: {
          not: null,
        },
      },
      userId,
    },
  });

  const assets = {
    fiis: [] as Asset[],
    stocks: [] as Asset[],
  };

  result.forEach((transaction) => {
    const asset = transaction.asset;
    if (asset.category === "FII") {
      assets.fiis.push(asset);
    } else if (asset.category === "ACAO") {
      assets.stocks.push(asset);
    }
  });

  res.json({
    assets,
  });
});

router.get("/:ticker", async (req: Request, res: Response) => {
  const userId = 1; // TODO: get userId from request

  const { ticker } = req.params;

  const transactions = await prisma.transaction.findMany({
    orderBy: {
      executedAt: "asc",
    },
    where: {
      asset: {
        ticker,
      },
      type: "Transferência - Liquidação",
      userId,
    },
  });

  let averagePrice = 0;
  let currentQuantity = 0;
  transactions.forEach((transaction) => {
    // Only purchases influence the average price
    if (transaction.side === "C") {
      const totalValue =
        currentQuantity * averagePrice +
        transaction.amount.toNumber() * transaction.value.toNumber();
      currentQuantity += transaction.amount.toNumber();
      averagePrice = totalValue / currentQuantity;
    }
  });

  const earningTansactions = await prisma.transaction.findMany({
    orderBy: {
      executedAt: "asc",
    },
    where: {
      asset: {
        ticker,
      },
      type: "Rendimento",
      userId,
    },
  });

  let totalEarnings = 0;
  earningTansactions.forEach((transaction) => {
    totalEarnings +=
      transaction.amount.toNumber() * transaction.value.toNumber();
  });

  const asset = await prisma.asset.findFirst({
    where: {
      ticker,
    },
  });

  let totalQuantity = 0;

  transactions.forEach((transaction) => {
    if (transaction.side === "C") {
      totalQuantity += transaction.amount.toNumber();
    } else {
      totalQuantity -= transaction.amount.toNumber();
    }
  });

  interface Response {
    avgPrice: number;
    cnpj: string;
    code: string;
    description: string;
    earnings: number;
    group: string;
    location: string;
    origin: string;
    positions: {
      value: number;
      year: number;
    }[];
    ticker: string;
    type: string;
  }

  if (asset?.category === "FII") {
    const response: Response = {
      avgPrice: averagePrice,
      cnpj: asset.cnpj || "000.000.000/0000-00",
      code: "03 - Fundos de Investimento Imobiliário",
      description: `${totalQuantity} cotas do FII de código ${asset.ticker} a um preço médio de R$ ${averagePrice.toFixed(2).replace(".", ",")}`,
      earnings: totalEarnings,
      group: "07 - Fundos",
      location: "Brasil",
      origin: "Brasil",
      positions: [
        {
          value: 0,
          year: 2024,
        },
        {
          value: 0,
          year: 2025,
        },
      ],
      ticker: asset.ticker,
      type: "FII",
    };

    res.json(response);
    return;
  } else if (asset?.category === "ACAO") {
    const response: Response = {
      avgPrice: averagePrice,
      cnpj: asset.cnpj || "000.000.000/0000-00",
      code: "01 - Ações (inclusive as listadas em Bolsa)",
      description: `${totalQuantity} ações da empresa ${asset.ticker} a um preço médio de R$ ${averagePrice.toFixed(2).replace(".", ",")}`,
      earnings: totalEarnings,
      group: "03 - Participações Societárias",
      location: "Brasil",
      origin: "Brasil",
      positions: [
        {
          value: 0,
          year: 2024,
        },
        {
          value: 0,
          year: 2025,
        },
      ],
      ticker: asset.ticker,
      type: "ACAO",
    };

    res.json(response);
    return;
  }
});

export default router;
