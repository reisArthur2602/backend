import type { Menu, Prisma } from '@prisma/client';
import type { CreateMenuDto } from '../domains/models/menu/CreateMenuDto.js';

import type { IMenuRepository } from '../domains/repositories/IMenuRepository.js';
import { prisma } from '../lib/prisma.js';
import type { GetMenuByKeywordsDto } from '../domains/models/menu/GetMenuByKeywordsDto.js';
import type { GetMenuByIdDto } from '../domains/models/menu/GetMenuByIdDto.js';
import type { DeleteMenuDto } from '../domains/models/menu/DeleteMenuDto.js';
import type { UpdateMenuDto } from '../domains/models/menu/UpdateMenuDto.js';

class MenuRepository implements IMenuRepository {
  public async get(): Promise<Prisma.MenuGetPayload<{ include: { options: true } }>[]> {
    const menu = await prisma.menu.findMany({ include: { options: true } });
    return menu;
  }

  public async getbyKeywords(data: GetMenuByKeywordsDto): Promise<Menu | null> {
    const menu = await prisma.menu.findFirst({
      where: {
        keywords: {
          hasSome: data.keywords,
        },
      },
    });

    return menu;
  }

  public async getbyId(data: GetMenuByIdDto): Promise<Menu | null> {
    const menu = await prisma.menu.findUnique({
      where: {
        id: data.id,
      },
    });

    return menu;
  }

  public async delete(data: DeleteMenuDto): Promise<Menu> {
    const menu = await prisma.menu.delete({
      where: {
        id: data.id,
      },
    });

    return menu;
  }

  public async create(data: CreateMenuDto) {
    const menu = await prisma.menu.create({
      data,
    });

    return menu;
  }

  public async update({ id, ...data }: UpdateMenuDto) {
    const menu = await prisma.menu.update({
      where: { id },
      data: data,
    });

    return menu;
  }
}

export default MenuRepository;
