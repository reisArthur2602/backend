import type { IUserRepository } from '../../domains/repositories/IUserRepository.js';
import UserRepository from '../../repositories/UserRepository.js';
import { NotFoundError } from '../../utils/error-handlers.js';

interface IGetDetailsUserService {
  id: string;
}

export default class GetDetailsUserService {
  private userRepository: IUserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async execute(data: IGetDetailsUserService) {
    const user = await this.userRepository.getbyId({ id: data.id });

    if (!user) throw new NotFoundError('O usuário não foi encontrado');

    return { user };
  }
}
