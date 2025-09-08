import type { User } from '@prisma/client';
import type { IUserRepository } from '../domain/repository/IUserRepository.js';
import type { GetUserbyEmailDto } from '../domain/dtos/GetUserByEmailDto.js';
import type { GetUserbyIdDto } from '../domain/dtos/GetUserByIdDto.js';
import type { CreateUserDto } from '../domain/dtos/CreateUserDto.js';
import { prisma } from '../../../infra/database/Prisma.js';

class UserRepository implements IUserRepository {
  public async getbyEmail(input: GetUserbyEmailDto): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });
    return user;
  }

  public async getbyId(input: GetUserbyIdDto): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id: input.id } });
    return user;
  }

  public async create(data: CreateUserDto): Promise<User> {
    const user = await prisma.user.create({ data });
    return user;
  }
}

export default UserRepository;
