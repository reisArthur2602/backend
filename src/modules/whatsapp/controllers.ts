import type { Request, Response } from "express";
import { createWhatsAppInstanceService } from "./services/create.js";

export const createWhatsAppInstanceController = async (
  request: Request,
  response: Response
) => {
  await createWhatsAppInstanceService();
  response.sendStatus(204);
};
