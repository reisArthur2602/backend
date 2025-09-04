import { prisma } from "../../../lib/prisma.js";
import { NotFoundError } from "../../../utils/error-handlers.js";

interface IDeleteMenuService {
  id: string;
}

export const deleteMenuService = async ({ id }: IDeleteMenuService) => {
  try {
    await prisma.menu.delete({ where: { id } });
  } catch (error) {
    throw new NotFoundError("Nenhum menu foi encontrado");
  }
};
