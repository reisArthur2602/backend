import type { IMenuRepository } from '../domain/repository/IMenuRepository.js';
import MenuRepository from '../repository/MenuRepository.js';
import type { IRedisCache } from '../../../infra/database/redis/Redis.js';
import RedisCache from '../../../infra/database/redis/Redis.js';
import { ConflictError } from '../../../utils/error-handlers.js';

interface ICreateMenuService {
  keywords: string[];
  name: string;
  message: string;
}

class CreateMenuService {
  private menuRepository: IMenuRepository;
  private redisCache: IRedisCache;

  constructor() {
    this.menuRepository = new MenuRepository();
    this.redisCache = new RedisCache();
  }

  public async execute(data: ICreateMenuService) {
    const menuExists = await this.menuRepository.getbyKeywords({
      keywords: data.keywords,
    });

    if (menuExists) {
      throw new ConflictError(`Uma ou mais palavras-chave já estão em uso`);
    }

    await this.menuRepository.create(data);
    await this.redisCache.invalidate({ key: 'menus' });
  }
}

export default CreateMenuService;
