import z from "zod";
import type { Request, Response } from "express";
import { createMenuService } from "./services/create.js";
import { getAllMenusService } from "./services/get-all.js";

export const createMenuController = async (
  request: Request,
  response: Response
) => {
  const { name, message, keywords } = z
    .object({
      name: z
        .string({ message: "O nome do menu é obrigatório" })
        .min(2, { message: "O nome do menu deve ter ao menos 2 caracteres" })
        .trim(),
      message: z
        .string({ message: "A mensagem do menu é obrigatória" })
        .min(5, { message: "A mensagem deve ter ao menos 5 caracteres" })
        .trim(),
      keywords: z.array(
        z
          .string()
          .toLowerCase()
          .min(2, {
            message: "Cada palavra-chave deve ter ao menos 2 caracteres",
          })
          .trim()
      ),
    })
    .parse(request.body);

  await createMenuService({ name, message, keywords });

  return response.sendStatus(201);
};

export const getAllMenusController = async (
  request: Request,
  response: Response
) => {
  const menus = await getAllMenusService();

  return response.status(200).json({ menus });
};
