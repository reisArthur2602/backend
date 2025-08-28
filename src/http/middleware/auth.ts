import type { NextFunction, Request, Response } from "express";
import {
  BadRequestError,
  UnauthorizedError,
} from "../../utils/error-handlers.js";

import jwt from "jsonwebtoken";

interface Payload {
  sub: string;
}

export const authMiddleware = (
  request: Request,
  _: Response,
  next: NextFunction
) => {
  const authHeader = request.headers.authorization;

  if (!authHeader)
    throw new UnauthorizedError("O usuário não está autenticado");

  const token = authHeader.split(" ")[1];
  if (!token) throw new BadRequestError("Token não fornecido");

  try {
    const { sub } = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as Payload;
    request.user_id = sub;
    return next();
  } catch (error) {
    throw new UnauthorizedError("O usuário não está autenticado");
  }
};
