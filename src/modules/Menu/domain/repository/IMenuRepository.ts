import type { Menu, Prisma } from '@prisma/client';

import type { GetMenuByKeywordsDto } from '../dtos/GetMenuByKeywordsDto.js';
import type { GetMenuByIdDto } from '../dtos/GetMenuByIdDto.js';
import type { CreateMenuDto } from '../dtos/CreateMenuDto.js';
import type { DeleteMenuDto } from '../dtos/DeleteMenuDto.js';
import type { UpdateMenuDto } from '../dtos/UpdateMenuDto.js';

export interface IMenuRepository {
  getbyKeywords: (data: GetMenuByKeywordsDto) => Promise<Menu | null>;
  getbyId: (data: GetMenuByIdDto) => Promise<Menu | null>;
  get: () => Promise<Prisma.MenuGetPayload<{ include: { options: true } }>[]>;
  delete: (data: DeleteMenuDto) => Promise<Menu>;
  create: (data: CreateMenuDto) => Promise<Menu>;
  update: (data: UpdateMenuDto) => Promise<Menu>;
}
