import { prisma } from "../../../lib/prisma.js";
import { NotFoundError } from "../../../utils/error-handlers.js";

interface IEditMenuService {
  id: string;
  name: string;
  message: string;
  keywords: string[];
}

export const editMenuService = async ({
  id,
  ...data
}: Partial<IEditMenuService>) => {
  try {
    const menu = await prisma.menu.update({
      where: { id: id as string },
      data,
    });

    return menu;
  } catch (error) {
    console.log("Erro ao editar menu:", error);
    throw new NotFoundError("O menu não foi encontrado");
  }
};
