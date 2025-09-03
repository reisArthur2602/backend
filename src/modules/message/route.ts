import { Router } from "express";
import { getMessageByLeadController } from "./controller.js";

export const messageRoute = Router();
messageRoute.get("/:phone", getMessageByLeadController);
