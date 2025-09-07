import MenuRepository from '../../repositories/MenuRepository.js';
import { ConflictError, NotFoundError } from '../../utils/error-handlers.js';

interface IDeleteMenuService {
  id: string;
}

class DeleteMenuService {
  private menuRepository: MenuRepository;

  constructor() {
    this.menuRepository = new MenuRepository();
  }

  public async execute(data: IDeleteMenuService) {
    const menuExists = await this.menuRepository.getbyId({ id: data.id });
    if (!menuExists) throw new NotFoundError('Nenhum menu foi encontrado');

    await this.menuRepository.delete({ id: data.id });
  }
}

export default DeleteMenuService;
