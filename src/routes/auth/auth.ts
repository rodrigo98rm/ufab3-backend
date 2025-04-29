import { Router } from "express";
import { Request, Response } from "express";
import { hashSync, compareSync } from "bcrypt";
import { prisma } from "../prisma";
import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET!;

const authRoutes: Router = Router();

authRoutes.post("/sign", async (req: Request, res: Response) => {
  const { email, lastName, name, password } = req.body;

  const user = await prisma.user.findFirst({ where: { email } });
  if (user) {
    res.status(400).json({error:"Email ja existe!"});
    return
  }
  const { createdAt, updatedAt, passwordHash: _, ...rest} = await prisma.user.create({
    data: {
      email,
      lastName,
      name,
      passwordHash: hashSync(password as string, 10),
    },
  });

  const response = { ...rest };

  res.json(response);
});

authRoutes.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  let user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    res.status(400).json({error:"Email nao existe!"});
    return
  }
  
  if (!compareSync(password, user.passwordHash)) {
    res.status(400).json({error:"Senha incorreta!"});
    return;
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
