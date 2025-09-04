import z from "zod";
import type { Request, Response } from "express";
import { createMenuService } from "./services/create-menu.js";
import { getMenusService } from "./services/get-menus.js";
import { deleteMenuService } from "./services/delete-menu.js";
import { editMenuService } from "./services/edit-menu.js";

export const createMenuController = async (
  request: Request,
  response: Response
) => {
  const { name, message, keywords } = z
    .object({
      name: z
        .string({ message: "Informe o nome do menu." })
        .min(2, { message: "O nome do menu deve ter pelo menos 2 caracteres." })
        .trim(),
      message: z
        .string({ message: "Informe a mensagem do menu." })
        .min(5, {
          message: "A mensagem do menu deve ter pelo menos 5 caracteres.",
        })
        .trim(),
      keywords: z.array(
        z
          .string()
          .toLowerCase()
          .min(2, {
            message: "Cada palavra-chave deve ter pelo menos 2 caracteres.",
          })
          .trim(),
        {
          message: "Adicione pelo menos uma palavra-chave.",
        }
      ),
    })
    .parse(request.body);

  await createMenuService({ name, message, keywords });

  return response.sendStatus(201);
};

export const deleteMenuController = async (
  request: Request,
  response: Response
) => {
  const { menu_id } = z
    .object({
      menu_id: z.string({ message: "O ID do menu é obrigatório." }).uuid({
        message: "O ID do menu deve estar em um formato UUID válido.",
      }),
    })
    .parse(request.params);
  await deleteMenuService({ id: menu_id });

  return response.sendStatus(204);
};

export const getMenusController = async (_: Request, response: Response) => {
  const menus = await getMenusService();

  return response.status(200).json(menus);
};

export const editMenuController = async (
  request: Request,
  response: Response
) => {
  const id = request.params.menu_id as string;

  const body = request.body as {
    name?: string;
    message?: string;
    keywords?: string[];
  };

  await editMenuService({ ...body, id });

  return response.sendStatus(200);
};
