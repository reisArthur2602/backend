import { prisma } from "../../../lib/prisma.js";
import { NotFoundError } from "../../../utils/error-handlers.js";

interface IDetailsUserService {
  user_id: string;
}

export const detailsUserService = async ({ user_id }: IDetailsUserService) => {
  const user = await prisma.user.findUnique({
    where: { id: user_id },
    omit: { password: true },
  });
  if (!user) throw new NotFoundError("O usuário não foi encontrado");
  return { user };
};
