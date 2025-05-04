import { compareSync, hashSync } from "bcrypt";
import { Router } from "express";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { prisma } from "../prisma";

export const JWT_SECRET = process.env.JWT_SECRET!;

const authRoutes: Router = Router();

interface SingUpBody {
  email: string;
  lastName: string;
  name: string;
  password: string;
}

authRoutes.post("/sign", async (req: Request, res: Response) => {
  const { email, lastName, name, password } = req.body as SingUpBody;

  const user = await prisma.user.findFirst({ where: { email } });
  if (user) {
    res.status(400).json({ error: "Email ja existe!" });
    return;
  }
  const {
    createdAt,
    passwordHash: _,
    updatedAt,
    ...rest
  } = await prisma.user.create({
    data: {
      email,
      lastName,
      name,
      passwordHash: hashSync(password, 10),
    },
  });

  const response = { ...rest };

  res.json(response);
});

interface LoginBody {
  email: string;
  password: string;
}

authRoutes.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginBody;

  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    res.status(400).json({ error: "Email nao existe!" });
    return;
  }

  if (!compareSync(password, user.passwordHash)) {
    res.status(400).json({ error: "Senha incorreta!" });
    return;
  }
  const token = jwt.sign(
    {
      userId: user.id,
    },
    JWT_SECRET,
  );

  res.json({ token, user });
});
export default authRoutes;
