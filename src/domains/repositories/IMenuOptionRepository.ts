import type { MenuOption } from '@prisma/client';
import type { CreateMenuOptionDto } from '../dtos/menu-option/CreateMenuOptionDto.js';
import type { DeleteMenuOptionDto } from '../dtos/menu-option/DeleteMenuOptionDto.js';
import type { GetMenuOptionByTriggerDto } from '../dtos/menu-option/GetMenuOptionByTriggerDto.js';
import type { GetMenuOptionByIdDto } from '../dtos/menu-option/GetMenuOptionByIdDto.js';

export interface IMenuOptionRepository {
  get: () => Promise<MenuOption[]>;
  create: (data: CreateMenuOptionDto) => Promise<MenuOption>;
  delete: (data: DeleteMenuOptionDto) => Promise<MenuOption>;
  getbyTrigger: (data: GetMenuOptionByTriggerDto) => Promise<MenuOption | null>;
  getbyId: (data: GetMenuOptionByIdDto) => Promise<MenuOption | null>;
}
