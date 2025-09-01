import type { Request, Response } from "express";
import z from "zod";
import { getMessageByLead } from "./services/get-by-lead.js";

export const getMessageByLeadController = async (
  request: Request,
  response: Response
) => {
  const { lead_id } = z
    .object({
      lead_id: z
        .string("O id do contato é um campo obrigatorio")
        .uuid({ message: "Formato inválido" }),
    })
    .parse(request.params);

  const messages = await getMessageByLead({ lead_id });

  return response.status(200).json(messages);
};
