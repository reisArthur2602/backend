import MenuOptionRepository from '../../repositories/MenuOptionRepository.js';
import { NotFoundError } from '../../utils/error-handlers.js';

interface IDeleteMenuOptionService {
  id: string;
}

class DeleteMenuOptionService {
  private menuOptionRepository: MenuOptionRepository;

  constructor() {
    this.menuOptionRepository = new MenuOptionRepository();
  }

  public async execute(data: IDeleteMenuOptionService) {
    const optionExists = await this.menuOptionRepository.getbyId({
      id: data.id,
    });

    if (!optionExists) throw new NotFoundError('Nenhuma opçao foi encontrada');

    await this.menuOptionRepository.delete({ id: data.id });
  }
}

export default DeleteMenuOptionService;
