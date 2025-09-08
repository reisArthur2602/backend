import { NotFoundError } from '../../../utils/error-handlers.js';
import type { IMenuOptionRepository } from '../domain/repository/IMenuOptionRepository.js';
import MenuOptionRepository from '../repository/MenuOptionRepository.js';

interface IDeleteMenuOptionService {
  id: string;
}

class DeleteMenuOptionService {
  private menuOptionRepository: IMenuOptionRepository;

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
