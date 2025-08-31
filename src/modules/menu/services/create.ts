import { prisma } from "../../../lib/prisma.js";
import { ConflictError } from "../../../utils/error-handlers.js";

interface ICreateMenuService {
  name: string;
  keywords: string[];
  message: string;
}

export const createMenuService = async ({
  keywords,
  message,
  name,
}: ICreateMenuService) => {
  const existingMenu = await prisma.menu.findFirst({
    where: {
      keywords: {
        hasSome: keywords,
      },
    },
  });

  if (existingMenu) {
    throw new ConflictError(
      `Uma ou mais palavras-chave já estão em uso pelo menu "${existingMenu.name}".`
    );
  }

  const menu = await prisma.menu.create({
    data: {
      keywords,
      message,
      name,
      config: {
        create: {
          start_time: "08:00",
          end_time: "18:00",
          days: ["monday", "friday", "thursday", "tuesday", "wednesday"],
        },
      },
    },
  });

  return menu;
};
