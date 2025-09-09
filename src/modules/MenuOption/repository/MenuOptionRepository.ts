import { prisma } from '../../../infra/database/Prisma.js';
import type { IMenuOptionRepository } from '../domain/repository/IMenuOptionRepository.js';

import type { DeleteMenuDto } from '../../Menu/domain/dtos/DeleteMenuDto.js';
import type { MenuOption } from '@prisma/client';
import type { CreateMenuOptionDto } from '../domain/dtos/CreateMenuOptionDto.js';
import type { GetMenuOptionByTriggerDto } from '../domain/dtos/GetMenuOptionByTriggerDto.js';
import type { GetMenuOptionByIdDto } from '../domain/dtos/GetMenuOptionByIdDto.js';
import type { GetMenuOptionByMenuDto } from '../domain/dtos/GetMenuOptionByMenu.js';

class MenuOptionRepository implements IMenuOptionRepository {
  public async create(data: CreateMenuOptionDto): Promise<MenuOption> {
    const options = await prisma.menuOption.create({
      data,
    });

    return options;
  }

  public async get(data: GetMenuOptionByMenuDto): Promise<MenuOption[]> {
    
    const options = await prisma.menuOption.findMany({
      where: {
        menu_id: data.id,
      },
    });
    return options;
  }

  public async getbyTrigger(
    data: GetMenuOptionByTriggerDto,
  ): Promise<MenuOption | null> {
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
    const options = await prisma.menuOption.findUnique({
      where: { id: data.id },
    });
    return options;
  }
}

export default MenuOptionRepository;
