import type { OptionAction } from '@prisma/client';
import type { IMenuOptionRepository } from '../domain/repository/IMenuOptionRepository.js';
import MenuOptionRepository from '../repository/MenuOptionRepository.js';
import { ConflictError } from '../../../utils/error-handlers.js';
import type { IRedisCache } from '../../../infra/database/redis/Redis.js';
import RedisCache from '../../../infra/database/redis/Redis.js';

interface ICreateMenuOptionService {
  menu_id: string;
  trigger: number;
  payload: any;
  label: string;
  action: OptionAction;
}

class CreateMenuOptionService {
  private menuOptionRepository: IMenuOptionRepository;
  private redisCache: IRedisCache;

  constructor() {
    this.menuOptionRepository = new MenuOptionRepository();
    this.redisCache = new RedisCache();
  }

  public async execute(data: ICreateMenuOptionService) {
    const existsMenuWithTrigger = await this.menuOptionRepository.getbyTrigger({
      menu_id: data.menu_id,
      trigger: data.trigger,
    });

    if (existsMenuWithTrigger) {
      throw new ConflictError('Este gatilho já está em uso');
    }

    await this.menuOptionRepository.create(data);

    await this.redisCache.invalidate({ key: 'menus' });
  }
}

export default CreateMenuOptionService;
