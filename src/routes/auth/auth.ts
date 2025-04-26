import { Router } from "express";
import { Request, Response } from "express";
import { hashSync, compareSync } from "bcrypt";
import { prisma } from "../prisma";
import * as jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET!;

const authRoutes: Router = Router();

authRoutes.post("/sign", async (req: Request, res: Response) => {
  const { email, passwordHash, name, lastName } = req.body;

  let user = await prisma.user.findFirst({ where: { email } });
  if (user) {
    throw Error("Usuario ja existe");
  }
  user = await prisma.user.create({
    data: {
      name,
      lastName,
      email,
      passwordHash: hashSync(passwordHash, 10),
    },
  });
  res.json(user);
});

authRoutes.post("/login", async (req: Request, res: Response) => {
  const { email, passwordHash } = req.body;

  let user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    throw Error("Usuario nao existe");
  }
  if (!compareSync(passwordHash, user.passwordHash)) {
    throw Error("Senha incorreta");
  }
  const token = jwt.sign(
    {
      userId: user.id,
    },
    JWT_SECRET,
  );

  res.json({ user, token });
});
export default authRoutes;
