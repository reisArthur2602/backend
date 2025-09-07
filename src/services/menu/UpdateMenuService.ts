import MenuRepository from '../../repositories/MenuRepository.js';
import { ConflictError } from '../../utils/error-handlers.js';

interface IUpdateMenuService {
  id: string;
  keywords?: string[];
  name?: string;
  message?: string;
}

class UpdateMenuService {
  private menuRepository: MenuRepository;

  constructor() {
    this.menuRepository = new MenuRepository();
  }

  public async execute(data: IUpdateMenuService) {
    const menuExists = await this.menuRepository.getbyId({ id: data.id });

    if (!menuExists) {
      throw new ConflictError(`Uma ou mais palavras-chave já estão em uso`);
    }

    await this.menuRepository.update(data);
  }
}

export default UpdateMenuService;
