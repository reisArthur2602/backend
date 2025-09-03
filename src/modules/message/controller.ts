import type { Request, Response } from "express";
import z from "zod";
import { getMessageByPhone } from "./services/get-by-phone.js";

export const getMessageByLeadController = async (
  request: Request,
  response: Response
) => {
  const { phone } = z
    .object({
      phone: z.string("O JID do usuário é um campo obrigatório"),
    })
    .parse(request.params);

  const messages = await getMessageByPhone({ phone });

  return response.status(200).json(messages);
};
