import MenuRepository from '../repository/MenuRepository.js';
import { ConflictError } from '../../../utils/error-handlers.js';
import type { IMenuRepository } from '../domain/repository/IMenuRepository.js';
import type { IRedisCache } from '../../../infra/database/redis/Redis.js';
import RedisCache from '../../../infra/database/redis/Redis.js';

interface IUpdateMenuService {
  id: string;
  keywords?: string[];
  name?: string;
  message?: string;
}

class UpdateMenuService {
  private menuRepository: IMenuRepository;
  private redisCache: IRedisCache;

  constructor() {
    this.menuRepository = new MenuRepository();
    this.redisCache = new RedisCache();
  }

  public async execute(data: IUpdateMenuService) {
    const menuExists = await this.menuRepository.getbyId({ id: data.id });

    if (!menuExists) {
      throw new ConflictError(`Uma ou mais palavras-chave já estão em uso`);
    }

    await this.menuRepository.update(data);
    await this.redisCache.invalidate({ key: 'menus' });
  }
}

export default UpdateMenuService;
