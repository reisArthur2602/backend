import { prisma } from "../../../lib/prisma.js";

export const getMenusService = async () => {
  const menus = await prisma.menu.findMany({
    include: { options: true },
  });

  return menus;
};
