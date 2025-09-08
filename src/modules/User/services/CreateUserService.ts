import { hash } from 'bcrypt';

import { ConflictError } from '../../../utils/error-handlers.js';
import UserRepository from '../repository/UserRepository.js';
import type { IUserRepository } from '../domain/repository/IUserRepository.js';
import type { CreateUserDto } from '../domain/dtos/CreateUserDto.js';

export default class CreateUserService {
  private userRepository: IUserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async execute(data: CreateUserDto) {
    const userExists = await this.userRepository.getbyEmail({
      email: data.email,
    });

    if (userExists) {
      throw new ConflictError('Este email já está associado a um usuário');
    }

    const passwordHash = await hash(data.password, 10);

    const user = await this.userRepository.create({
      email: data.email,
      name: data.name,
      password: passwordHash,
    });

    return user;
  }
}
