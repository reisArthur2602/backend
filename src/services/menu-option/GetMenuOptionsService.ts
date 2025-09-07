import MenuOptionRepository from '../../repositories/MenuOptionRepository.js';

class GetMenuOptionService {
  private menuOptionRepository: MenuOptionRepository;

  constructor() {
    this.menuOptionRepository = new MenuOptionRepository();
  }

  public async execute() {
    const options = await this.menuOptionRepository.get();

    return options;
  }
}

export default GetMenuOptionService;
