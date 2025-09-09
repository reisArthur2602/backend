import type { IMenuOptionRepository } from '../domain/repository/IMenuOptionRepository.js';
import MenuOptionRepository from '../repository/MenuOptionRepository.js';

interface IGetMenuOptionService {
  id: string;
}

class GetMenuOptionService {
  private menuOptionRepository: IMenuOptionRepository;

  constructor() {
    this.menuOptionRepository = new MenuOptionRepository();
  }

  public async execute(data: IGetMenuOptionService) {
    const options = await this.menuOptionRepository.get({ id: data.id });
    return options;
  }
}

export default GetMenuOptionService;
