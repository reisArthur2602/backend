import type { Request, Response } from 'express';
import z from 'zod';
import CreateUserSessionService from '../services/CreateUserSession.js';
import GetDetailsUserService from '../services/GetDetailsUserService.js';
import CreateUserService from '../services/CreateUserService.js';

export default class UserController {
  async create(request: Request, response: Response) {
    const data = z
      .object({
        email: z
          .string({ message: 'O email é um campo obrigatório' })
          .email('Insira um formato de email válido')
          .trim(),
        password: z.string().min(6, {
          message: 'A senha deve ter no mínimo 6 caracteres',
        }),
        name: z
          .string({ message: 'O nome é um campo obrigatório' })
          .min(6, {
            message: 'O nome deve ter no mínimo 6 caracteres',
          })
          .trim()
          .toLowerCase(),
      })
      .parse(request.body);

    const createUserService = new CreateUserService();
    const user = createUserService.execute(data);
    return response.status(201).json(user);
  }

  async session(request: Request, response: Response) {
    const data = z
      .object({
        email: z
          .string({ message: 'O email é um campo obrigatório' })
          .email('Insira um formato de email válido')
          .trim(),
        password: z.string().min(6, {
          message: 'A senha deve ter no mínimo 6 caracteres',
        }),
      })
      .parse(request.body);

    const createSessionUserService = new CreateUserSessionService();

    const user = await createSessionUserService.execute(data);

    return response.status(200).json(user);
  }

  async details(request: Request, response: Response) {
    const user_id = request.user_id;

    const getDetailsUserService = new GetDetailsUserService();

    const user = await getDetailsUserService.execute({ id: user_id });

    return response.status(200).json(user);
  }
}
