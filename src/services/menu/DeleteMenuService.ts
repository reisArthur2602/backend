import MenuRepository from '../../repositories/MenuRepository.js';
import type { IRedisCache } from '../../shared/cache/RedisCache.js';
import RedisCache from '../../shared/cache/RedisCache.js';
import { ConflictError, NotFoundError } from '../../utils/error-handlers.js';

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
