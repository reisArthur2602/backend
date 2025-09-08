import type { Request, Response } from 'express';
import z from 'zod';

import type { OptionAction } from '@prisma/client';
import CreateMenuOptionService from '../services/CreateMenuOptionService.js';
import DeleteMenuOptionService from '../services/DeleteMenuOptionService.js';
import GetMenuOptionService from '../services/GetMenuOptionsService.js';

export default class MenuOptionController {
  async create(request: Request, response: Response) {
    const data = z
      .object({
        menu_id: z.string().min(1, { message: 'Informe o identificador do menu.' }),
        trigger: z.coerce.number({
          message: 'O gatilho deve ser um número válido.',
        }),
        label: z.string().min(1, { message: 'Informe o rótulo da opção.' }),
        payload: z.any(),
        action: z.string<OptionAction>({
          message: 'A ação informada não é válida.',
        }),
      })
      .parse(request.body);

    const createMenuOptionService = new CreateMenuOptionService();

    await createMenuOptionService.execute(data);

    return response.sendStatus(201);
  }

  async delete(request: Request, response: Response) {
    const data = z
      .object({
        option_id: z.string({ message: 'O ID da opção é obrigatório.' }).uuid({
          message: 'O ID da opção deve estar em um formato UUID válido.',
        }),
      })
      .parse(request.params);

    const deleteMenuOptionService = new DeleteMenuOptionService();

    await deleteMenuOptionService.execute({ id: data.option_id });

    return response.sendStatus(204);
  }

  async get(request: Request, response: Response) {
    const getMenusOptionService = new GetMenuOptionService();

    const options = await getMenusOptionService.execute();

    return response.status(200).json(options);
  }
}
