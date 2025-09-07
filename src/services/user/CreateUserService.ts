import { hash } from 'bcrypt';
import type { CreateUserDto } from '../../domains/models/user/CreateUserDto.js';
import type { IUserRepository } from '../../domains/repositories/IUserRepository.js';
import UserRepository from '../../repositories/UserRepository.js';
import { ConflictError } from '../../utils/error-handlers.js';

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
