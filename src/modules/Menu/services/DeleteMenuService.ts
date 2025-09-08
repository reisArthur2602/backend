import MenuRepository from '../repository/MenuRepository.js';
import type { IRedisCache } from '../../../infra/database/redis/Redis.js';
import RedisCache from '../../../infra/database/redis/Redis.js';
import { NotFoundError } from '../../../utils/error-handlers.js';

interface IDeleteMenuService {
  id: string;
}

class DeleteMenuService {
  private menuRepository: MenuRepository;
  private redisCache: IRedisCache;
  constructor() {
    this.menuRepository = new MenuRepository();
    this.redisCache = new RedisCache();
  }

  public async execute(data: IDeleteMenuService) {
    const menuExists = await this.menuRepository.getbyId({ id: data.id });
    if (!menuExists) throw new NotFoundError('Nenhum menu foi encontrado');

    await this.menuRepository.delete({ id: data.id });
    await this.redisCache.invalidate({ key: 'menus' });
  }
}

export default DeleteMenuService;
