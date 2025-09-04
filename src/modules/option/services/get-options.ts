import { prisma } from "../../../lib/prisma.js";

export const getOptionsService = async () => {
  const options = await prisma.menuOption.findMany();
  return options;
};
