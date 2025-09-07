import type { User } from '@prisma/client';
import type { CreateUserDto } from '../models/user/CreateUserDto.js';
import type { GetUserbyEmailDto } from '../models/user/GetUserByEmailDto.js';
import type { GetUserbyIdDto } from '../models/user/GetUserByIdDto .js';

export interface IUserRepository {
  create: (data: CreateUserDto) => Promise<User>;
  getbyEmail: (data: GetUserbyEmailDto) => Promise<User | null>;
  getbyId: (data: GetUserbyIdDto) => Promise<User | null>;
}
