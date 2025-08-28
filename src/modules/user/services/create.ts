import { hash } from "bcrypt";
import { prisma } from "../../../lib/prisma.js";

interface ICreateUserService {
  email: string;
  password: string;
}

export const CreateUserService = async ({
  email,
  password,
}: ICreateUserService) => {
  const userEmailExists = await prisma.user.findUnique({ where: { email } });

  if (userEmailExists)
    throw new Error("Este email já está associado a um usuário");

  const passwordHash = await hash(password, 8);

  const user = await prisma.user.create({
    data: { email, password: passwordHash },
  });

  return {
    user,
  };
};
