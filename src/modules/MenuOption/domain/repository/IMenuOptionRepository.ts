import type { MenuOption } from '@prisma/client';
import type { CreateMenuOptionDto } from '../dtos/CreateMenuOptionDto.js';
import type { DeleteMenuOptionDto } from '../dtos/DeleteMenuOptionDto.js';
import type { GetMenuOptionByTriggerDto } from '../dtos/GetMenuOptionByTriggerDto.js';
import type { GetMenuOptionByIdDto } from '../dtos/GetMenuOptionByIdDto.js';
import type { GetMenuOptionByMenuDto } from '../dtos/GetMenuOptionByMenu.js';

export interface IMenuOptionRepository {
  get: (data: GetMenuOptionByMenuDto) => Promise<MenuOption[]>;
  create: (data: CreateMenuOptionDto) => Promise<MenuOption>;
  delete: (data: DeleteMenuOptionDto) => Promise<MenuOption>;
  getbyTrigger: (data: GetMenuOptionByTriggerDto) => Promise<MenuOption | null>;
  getbyId: (data: GetMenuOptionByIdDto) => Promise<MenuOption | null>;
}
