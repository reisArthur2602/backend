import type { Response, Request } from "express";
import { getLeadsService } from "./services/get.js";

export const getLeadsController = async (
  request: Request,
  response: Response
) => {
  const leads = await getLeadsService();
  return response.status(200).json(leads);
};
