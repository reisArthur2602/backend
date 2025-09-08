import type { Prisma } from '@prisma/client';
import MenuRepository from '../repository/MenuRepository.js';
import type { IRedisCache } from '../../../infra/database/redis/Redis.js';
import RedisCache from '../../../infra/database/redis/Redis.js';

class GetMenusService {
  private menuRepository: MenuRepository;
  private redisCache: IRedisCache;

  constructor() {
    this.menuRepository = new MenuRepository();
    this.redisCache = new RedisCache();
  }

  public async execute() {
    let menus = await this.redisCache.recover<
      Prisma.MenuGetPayload<{ include: { options: true } }>[]
    >({ key: 'menus' });

    if (menus && menus?.length > 0) return menus;

    menus = await this.menuRepository.get();
    await this.redisCache.save({ key: 'menus', value: menus });

    return menus;
  }
}

export default GetMenusService;
