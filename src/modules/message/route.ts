import { Router } from "express";
import { getMessageByLeadController } from "./controller.js";

export const messageRoute = Router();
messageRoute.get("/:lead_id", getMessageByLeadController);
