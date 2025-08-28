import { compare } from "bcrypt";
import {
  NotFoundError,
  UnauthorizedError,
} from "../../../utils/error-handlers.js";
import { prisma } from "../../../lib/prisma.js";
import jwt from "jsonwebtoken";

interface ISessionUserService {
  email: string;
  password: string;
}

export const sessionUserService = async ({
  email,
  password,
}: ISessionUserService) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new NotFoundError("Email/Senha inválido");

  const passwordMatch = await compare(password, user.password);

  if (!passwordMatch) {
    throw new UnauthorizedError("Email/Senha inválido");
  }

  const accessToken = jwt.sign({}, process.env.JWT_SECRET as string, {
    subject: user.id,
    expiresIn: "7d",
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    accessToken,
  };
};
