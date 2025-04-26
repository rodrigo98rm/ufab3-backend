import XLSX from "xlsx";

import { RawTransaction } from "./tablesInterface";
import { PrismaClient } from "../../generated/prisma/index.js";
import { regexTicker, regexProduto } from "../helpers/regexHelpers.js";
import { formatDate, formatValue } from "../helpers/formatHelpers.js";

const prisma = new PrismaClient();

export const parserXlsx = async (buffer: Buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data: RawTransaction[] = XLSX.utils.sheet_to_json(sheet);
  parseTransations(data);
  return "Operações enviadas";
};

const parseTransations = async (data: RawTransaction[]) => {
  const assetCache = new Map<string, number>();
  let assetId: number | undefined;
  const transactionsArray = [];
  const userId = 1;

  for (const transacao of data) {
    const ticker: string = regexTicker(transacao["Produto"]);

    if (!ticker) continue;

    if (!assetCache.has(ticker)) {
      const existingAsset = await prisma.asset.findFirst({
        where: { ticker },
      });

      if (existingAsset) {
        assetId = existingAsset.id;
      } else {
        const newAsset = await prisma.asset.create({
          data: {
            ticker,
            name: regexProduto(transacao["Produto"]),
          },
        });
        assetId = newAsset.id;
      }
      if (assetId) {
        assetCache.set(ticker, assetId);
      }
    } else {
      assetId = assetCache.get(ticker);
    }

    if (assetId === undefined) continue;

    const side =
      transacao["Entrada/Saída"].toLowerCase() === "credito" ? "C" : "D";
    const description = "-";
    const executedAt = formatDate(transacao["Data"]);
    const type = transacao["Movimentação"];
    const institution = transacao["Instituição"];
    const amount = transacao["Quantidade"];
    const value = formatValue(transacao["Preço unitário"]);
    const totalValue = formatValue(transacao["Valor da Operação"]);

    transactionsArray.push({
      side,
      description,
      executedAt,
      type,
      institution,
      amount,
      value,
      totalValue,
      userId,
      assetId,
    });
  }

  await prisma.transaction.createMany({
    data: transactionsArray,
  });
  console.log(transactionsArray);
  return transactionsArray;
};
