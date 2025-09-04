import type { Request, Response } from "express";
import z from "zod";
import { createOptionsService } from "./services/create-option.js";
import { OptionAction } from "@prisma/client";
import { getOptionsService } from "./services/get-options.js";
import { deleteOptionService } from "./services/delete-option.js";

export const createOptionController = async (
  request: Request,
  response: Response
) => {
  
  const { menu_id, trigger, label, payload, action } = z
    .object({
      menu_id: z
        .string()
        .min(1, { message: "Informe o identificador do menu." }),
      trigger: z.coerce.number({
        message: "O gatilho deve ser um número válido.",
      }),
      label: z.string().min(1, { message: "Informe o rótulo da opção." }),
      payload: z.any(),
      action: z.string<OptionAction>({
        message: "A ação informada não é válida.",
      }),
    })
    .parse(request.body);

  await createOptionsService({ menu_id, trigger, label, payload, action });

  return response.sendStatus(201);
};

export const deleteOptionController = async (
  request: Request,
  response: Response
) => {
  const { option_id } = z
    .object({
      option_id: z.string({ message: "O ID da opção é obrigatório." }).uuid({
        message: "O ID da opção deve estar em um formato UUID válido.",
      }),
    })
    .parse(request.params);
  await deleteOptionService({ id: option_id });
  return response.status(204);
};

export const getOptionsController = async (_: Request, response: Response) => {
  const options = await getOptionsService();
  return response.status(200).json(options);
};
