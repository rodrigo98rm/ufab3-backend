import { Request, Response } from "express";

import { parserXlsx } from "./parseXlsx.js";

export const uploadXlsx = async (req: Request, res: Response) => {
  const file = req.file;
  const userId = req.user.userId as number;

  if (!file) {
    res.status(400).json({ error: "Nenhum arquivo enviado" });
    return;
  }

  try {
    const data = await parserXlsx(file.buffer, userId);

    res.json({ data, message: "Arquivo processado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao processar o arquivo" });
  }
};
