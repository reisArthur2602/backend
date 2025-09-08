import type { Menu, Prisma } from '@prisma/client';
import type { CreateMenuDto } from '../domain/dtos/CreateMenuDto.js';

import type { IMenuRepository } from '../domain/repository/IMenuRepository.js';
import { prisma } from '../../../infra/database/Prisma.js';
import type { GetMenuByKeywordsDto } from '../domain/dtos/GetMenuByKeywordsDto.js';
import type { GetMenuByIdDto } from '../domain/dtos/GetMenuByIdDto.js';
import type { DeleteMenuDto } from '../domain/dtos/DeleteMenuDto.js';
import type { UpdateMenuDto } from '../domain/dtos/UpdateMenuDto.js';

class MenuRepository implements IMenuRepository {
  public async get(): Promise<
    Prisma.MenuGetPayload<{ include: { options: true } }>[]
  > {
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
