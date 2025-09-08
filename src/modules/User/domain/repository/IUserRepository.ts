import type { User } from '@prisma/client';

import type { CreateUserDto } from '../dtos/CreateUserDto.js';
import type { GetUserbyEmailDto } from '../dtos/GetUserByEmailDto.js';
import type { GetUserbyIdDto } from '../dtos/GetUserByIdDto.js';

export interface IUserRepository {
  create: (data: CreateUserDto) => Promise<User>;
  getbyEmail: (data: GetUserbyEmailDto) => Promise<User | null>;
  getbyId: (data: GetUserbyIdDto) => Promise<User | null>;
}
