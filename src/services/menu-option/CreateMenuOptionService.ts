import type { OptionAction } from '@prisma/client';
import type { IMenuOptionRepository } from '../../domains/repositories/IMenuOptionRepository.js';
import MenuOptionRepository from '../../repositories/MenuOptionRepository.js';
import { ConflictError } from '../../utils/error-handlers.js';

interface ICreateMenuOptionService {
  menu_id: string;
  trigger: number;
  payload: any;
  label: string;
  action: OptionAction;
}

class CreateMenuOptionService {
  private menuOptionRepository: IMenuOptionRepository;

  constructor() {
    this.menuOptionRepository = new MenuOptionRepository();
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
  }
}

export default CreateMenuOptionService;
