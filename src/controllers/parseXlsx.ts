import XLSX from "xlsx";

import { PrismaClient } from "../../generated/prisma/index.js";
import { formatDate, formatValue } from "../helpers/formatHelpers.js";
import { regexProduto, regexTicker } from "../helpers/regexHelpers.js";
import { RawTransaction } from "./tablesInterface";

const prisma = new PrismaClient();

export const parserXlsx = async (buffer: Buffer, userId: number) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data: RawTransaction[] = XLSX.utils.sheet_to_json(sheet);
  void parseTransations(data, userId);
  return "Operações enviadas";
};

const parseTransations = async (data: RawTransaction[], userId: number) => {
  const assetCache = new Map<string, number>();
  let assetId: number | undefined;
  const transactionsArray = [];

  for (const transacao of data) {
    const ticker: string = regexTicker(transacao.Produto);

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
            name: regexProduto(transacao.Produto),
            ticker,
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
    const executedAt = formatDate(transacao.Data);
    const type = transacao["Movimentação"];
    const institution = transacao["Instituição"];
    const amount = transacao.Quantidade;
    const value = formatValue(transacao["Preço unitário"]);
    const totalValue = formatValue(transacao["Valor da Operação"]);

    transactionsArray.push({
      amount,
      assetId,
      description,
      executedAt,
      institution,
      side,
      totalValue,
      type,
      userId,
      value,
    });
  }

  await prisma.transaction.createMany({
    data: transactionsArray,
  });
  console.log(transactionsArray);
  return transactionsArray;
};
