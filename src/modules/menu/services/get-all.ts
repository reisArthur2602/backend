import { prisma } from "../../../lib/prisma.js";

export const getAllMenusService = async () => {
  const menus = await prisma.menu.findMany({
    include: { config: true, options: true },
  });

  return menus;
};
