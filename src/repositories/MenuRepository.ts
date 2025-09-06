import { prisma } from "../lib/prisma.js";

class MenuRepository {
  public async get() {
    const menu = await prisma.menu.findMany();
    return menu;
  }

  public async getByKeyword(input: { keywords: string[] }) {
    const menu = await prisma.menu.findFirst({
      where: {
        keywords: {
          hasSome: input.keywords,
        },
      },
    });

    return menu;
  }

  public async getById(input: { id: string }) {
    const menu = await prisma.menu.findUnique({
      where: {
        id: input.id,
      },
    });

    return menu;
  }

  public async create(input: {
    name: string;
    message: string;
    keywords: string[];
  }) {
    const menu = await prisma.menu.create({
      data: input,
    });

    return menu;
  }

  public async update({
    id,
    ...input
  }: {
    id: string;
    name?: string;
    message?: string;
    keywords?: string[];
  }) {
    const menu = await prisma.menu.update({
      where: { id },
      data: input,
    });

    return menu;
  }

  public async delete(input: { id: string }) {
    const menu = await prisma.menu.delete({
      where: {
        id: input.id,
      },
    });

    return menu;
  }
}

export default MenuRepository;
