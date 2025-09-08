import { NotFoundError } from '../../../utils/error-handlers.js';
import type { IUserRepository } from '../domain/repository/IUserRepository.js';
import UserRepository from '../repository/UserRepository.js';

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
