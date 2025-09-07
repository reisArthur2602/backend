import { prisma } from '../lib/prisma.js';
import type { IMenuOptionRepository } from '../domains/repositories/IMenuOptionRepository.js';
import type { CreateMenuOptionDto } from '../domains/models/menu-option/CreateMenuOptionDto.js';
import type { DeleteMenuDto } from '../domains/models/menu/DeleteMenuDto.js';
import type { MenuOption } from '@prisma/client';
import type { GetMenuOptionByTriggerDto } from '../domains/models/menu-option/GetMenuOptionByTriggerDto.js';
import type { GetMenuOptionByIdDto } from '../domains/models/menu-option/GetMenuOptionByIdDto.js';

class MenuOptionRepository implements IMenuOptionRepository {
  public async create(data: CreateMenuOptionDto): Promise<MenuOption> {
    const options = await prisma.menuOption.create({
      data,
    });

    return options;
  }

  public async get(): Promise<MenuOption[]> {
    const options = await prisma.menuOption.findMany();
    return options;
  }

  public async getbyTrigger(data: GetMenuOptionByTriggerDto): Promise<MenuOption | null> {
    const option = await prisma.menuOption.findUnique({
      where: {
        menu_id: data.menu_id,
        trigger: data.trigger,
      },
    });

    return option;
  }

  public async delete(data: DeleteMenuDto): Promise<MenuOption> {
    const options = await prisma.menuOption.delete({ where: { id: data.id } });
    return options;
  }

  public async getbyId(data: GetMenuOptionByIdDto) {
    const options = await prisma.menuOption.findUnique({ where: { id: data.id } });
    return options;
  }
}

export default MenuOptionRepository;
