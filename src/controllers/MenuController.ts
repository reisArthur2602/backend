import type { Request, Response } from 'express';
import z from 'zod';

import CreateMenuService from '../services/menu/CreateMenuService.js';
import DeleteMenuService from '../services/menu/DeleteMenuService.js';
import GetMenusService from '../services/menu/GetMenuService.js';
import UpdateMenuService from '../services/menu/UpdateMenuService.js';

export default class MenuController {
  async create(request: Request, response: Response) {
    const data = z
      .object({
        name: z
          .string({ message: 'Informe o nome do menu.' })
          .min(2, {
            message: 'O nome do menu deve ter pelo menos 2 caracteres.',
          })
          .trim(),
        message: z
          .string({ message: 'Informe a mensagem do menu.' })
          .min(5, {
            message: 'A mensagem do menu deve ter pelo menos 5 caracteres.',
          })
          .trim(),
        keywords: z.array(
          z
            .string()
            .toLowerCase()
            .min(2, {
              message: 'Cada palavra-chave deve ter pelo menos 2 caracteres.',
            })
            .trim(),
          {
            message: 'Adicione pelo menos uma palavra-chave.',
          },
        ),
      })
      .parse(request.body);

    const createMenuService = new CreateMenuService();

    await createMenuService.execute(data);

    return response.sendStatus(201);
  }

  async delete(request: Request, response: Response) {
    const data = z
      .object({
        menu_id: z.string({ message: 'O ID do menu é obrigatório.' }).uuid({
          message: 'O ID do menu deve estar em um formato UUID válido.',
        }),
      })
      .parse(request.params);

    const deleteMenuService = new DeleteMenuService();

    await deleteMenuService.execute({ id: data.menu_id });

    return response.sendStatus(204);
  }

  async get(request: Request, response: Response) {
    const getMenusService = new GetMenusService();

    const menus = await getMenusService.execute();

    return response.status(200).json(menus);
  }

  async update(request: Request, response: Response) {
    const data = z
      .object({
        menu_id: z.string({ message: 'O ID do menu é obrigatório.' }).uuid({
          message: 'O ID do menu deve estar em um formato UUID válido.',
        }),
      })
      .parse(request.params);

    const body = request.body as {
      name?: string;
      message?: string;
      keywords?: string[];
    };

    const updateMenuService = new UpdateMenuService();

    await updateMenuService.execute({ ...body, id: data.menu_id });

    return response.sendStatus(200);
  }
}
