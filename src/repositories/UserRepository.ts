import type { User } from '@prisma/client';
import type { CreateUserDto } from '../domains/models/user/CreateUserDto.js';
import type { IUserRepository } from '../domains/repositories/IUserRepository.js';
import type { GetUserbyEmailDto } from '../domains/models/user/GetUserByEmailDto.js';
import type { GetUserbyIdDto } from '../domains/models/user/GetUserByIdDto .js';

import { prisma } from '../lib/prisma.js';

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
