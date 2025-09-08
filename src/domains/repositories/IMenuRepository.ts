import type { Menu, Prisma } from '@prisma/client';

import type { GetMenuByKeywordsDto } from '../dtos/menu/GetMenuByKeywordsDto.js';
import type { GetMenuByIdDto } from '../dtos/menu/GetMenuByIdDto.js';
import type { CreateMenuDto } from '../dtos/menu/CreateMenuDto.js';
import type { DeleteMenuDto } from '../dtos/menu/DeleteMenuDto.js';
import type { UpdateMenuDto } from '../dtos/menu/UpdateMenuDto.js';

export interface IMenuRepository {
  getbyKeywords: (data: GetMenuByKeywordsDto) => Promise<Menu | null>;
  getbyId: (data: GetMenuByIdDto) => Promise<Menu | null>;
  get: () => Promise<Prisma.MenuGetPayload<{ include: { options: true } }>[]>;
  delete: (data: DeleteMenuDto) => Promise<Menu>;
  create: (data: CreateMenuDto) => Promise<Menu>;
  update: (data: UpdateMenuDto) => Promise<Menu>;
}
