import { compare } from 'bcrypt';
import UserRepository from '../../repositories/UserRepository.js';
import {
  NotFoundError,
  UnauthorizedError,
} from '../../utils/error-handlers.js';

import type { IUserRepository } from '../../domains/repositories/IUserRepository.js';
import jwt from 'jsonwebtoken';

interface ICreateUserSessionService {
  email: string;
  password: string;
}

export default class CreateUserSessionService {
  private userRepository: IUserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async execute(data: ICreateUserSessionService) {
    const userExists = await this.userRepository.getbyEmail({
      email: data.email,
    });

    if (!userExists) {
      throw new NotFoundError('Email/Senha inválido');
    }

    const passwordMatch = await compare(data.password, userExists.password);

    if (!passwordMatch) {
      throw new UnauthorizedError('Email/Senha inválido');
    }

    const accessToken = jwt.sign({}, process.env.JWT_SECRET as string, {
      subject: userExists.id,
      expiresIn: '7d',
    });

    return {
      user: {
        id: userExists.id,
        email: userExists.email,
        name: userExists.name,
      },
      accessToken,
    };
  }
}
