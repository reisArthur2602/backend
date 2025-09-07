import MenuRepository from '../../repositories/MenuRepository.js';
import { ConflictError } from '../../utils/error-handlers.js';

interface ICreateMenuService {
  keywords: string[];
  name: string;
  message: string;
}

class CreateMenuService {
  private menuRepository: MenuRepository;

  constructor() {
    this.menuRepository = new MenuRepository();
  }

  public async execute(data: ICreateMenuService) {
    const menuExists = await this.menuRepository.getbyKeywords({ keywords: data.keywords });

    if (menuExists) {
      throw new ConflictError(`Uma ou mais palavras-chave já estão em uso`);
    }

    await this.menuRepository.create(data);
  }
}

export default CreateMenuService;
