import type { IMenuOptionRepository } from '../domain/repository/IMenuOptionRepository.js';
import MenuOptionRepository from '../repository/MenuOptionRepository.js';

class GetMenuOptionService {
  private menuOptionRepository: IMenuOptionRepository;

  constructor() {
    this.menuOptionRepository = new MenuOptionRepository();
  }

  public async execute() {
    const options = await this.menuOptionRepository.get();

    return options;
  }
}

export default GetMenuOptionService;
