import { hash } from "bcrypt";
import { prisma } from "../../../lib/prisma.js";
import { ConflictError } from "../../../utils/error-handlers.js";

interface ICreateUserService {
  email: string;
  password: string;
  name: string;
}

export const createUserService = async ({
  email,
  password,
  name,
}: ICreateUserService) => {
  const userEmailExists = await prisma.user.findUnique({ where: { email } });

  if (userEmailExists)
    throw new ConflictError("Este email já está associado a um usuário");

  const passwordHash = await hash(password, 8);

  const user = await prisma.user.create({
    data: { email, password: passwordHash, name },
    omit: {
      password: true,
    },
  });

  return {
    user,
  };
};
