import type { Request, Response } from "express";
import z from "zod";
import { createOptionsService } from "./services/create.js";
import { MenuOptionAction } from "@prisma/client";

export const createOptionController = async (
  request: Request,
  response: Response
) => {
  const { options } = z
    .object({
      options: z
        .array(
          z.object({
            menu_id: z.string().min(1, "O menuId é obrigatório"),
            trigger: z.coerce.number(),
            label: z.string().min(1, "O rótulo é obrigatório"),
            reply_text: z.string().nullable(),

            action: z.nativeEnum(MenuOptionAction),
          })
        )
        .min(1, "Adicione pelo menos uma opção"),
    })
    .parse(request.body);

  await createOptionsService({ options });

  return response.sendStatus(201);
};
