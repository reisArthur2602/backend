import type { MenuOption } from '@prisma/client';
import type { CreateMenuOptionDto } from '../models/menu-option/CreateMenuOptionDto.js';
import type { DeleteMenuOptionDto } from '../models/menu-option/DeleteMenuOptionDto.js';
import type { GetMenuOptionByTriggerDto } from '../models/menu-option/GetMenuOptionByTriggerDto.js';
import type { GetMenuOptionByIdDto } from '../models/menu-option/GetMenuOptionByIdDto.js';

export interface IMenuOptionRepository {
  get: () => Promise<MenuOption[]>;
  create: (data: CreateMenuOptionDto) => Promise<MenuOption>;
  delete: (data: DeleteMenuOptionDto) => Promise<MenuOption>;
  getbyTrigger: (data: GetMenuOptionByTriggerDto) => Promise<MenuOption | null>;
  getbyId: (data: GetMenuOptionByIdDto) => Promise<MenuOption | null>;
}
