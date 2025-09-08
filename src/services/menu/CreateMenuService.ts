import type { IMenuRepository } from '../../domains/repositories/IMenuRepository.js';
import MenuRepository from '../../repositories/MenuRepository.js';
import type { IRedisCache } from '../../shared/cache/RedisCache.js';
import RedisCache from '../../shared/cache/RedisCache.js';
import { ConflictError } from '../../utils/error-handlers.js';

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
    const menuExists = await this.menuRepository.getbyKeywords({ keywords: data.keywords });

    if (menuExists) {
      throw new ConflictError(`Uma ou mais palavras-chave já estão em uso`);
    }

    await this.menuRepository.create(data);
    await this.redisCache.invalidate({ key: 'menus' });
  }
}

export default CreateMenuService;
