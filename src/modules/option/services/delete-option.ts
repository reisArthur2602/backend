import { prisma } from "../../../lib/prisma.js";
import { NotFoundError } from "../../../utils/error-handlers.js";

interface IDeleteOptionService {
  id: string;
}
export const deleteOptionService = async ({ id }: IDeleteOptionService) => {
  try {
    await prisma.menuOption.delete({ where: { id } });
  } catch (error) {
    throw new NotFoundError("Nenhuma opção foi encontrada");
  }
};
