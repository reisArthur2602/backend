import type { Menu, Prisma } from '@prisma/client';

import type { GetMenuByKeywordsDto } from '../models/menu/GetMenuByKeywordsDto.js';
import type { GetMenuByIdDto } from '../models/menu/GetMenuByIdDto.js';
import type { CreateMenuDto } from '../models/menu/CreateMenuDto.js';
import type { DeleteMenuDto } from '../models/menu/DeleteMenuDto.js';
import type { UpdateMenuDto } from '../models/menu/UpdateMenuDto.js';

export interface IMenuRepository {
  getbyKeywords: (data: GetMenuByKeywordsDto) => Promise<Menu | null>;
  getbyId: (data: GetMenuByIdDto) => Promise<Menu | null>;
  get: () => Promise<Prisma.MenuGetPayload<{ include: { options: true } }>[]>;
  delete: (data: DeleteMenuDto) => Promise<Menu>;
  create: (data: CreateMenuDto) => Promise<Menu>;
  update: (data: UpdateMenuDto) => Promise<Menu>;
}
