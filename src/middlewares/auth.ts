import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET!;

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token não informado" });
    return;
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    console.log("user", user);

    if (err) {
      res.status(403).json({ message: "Token inválido" });
      return;
    }

    // @ts-ignore
    req.user = user;
    next();
  });
};
