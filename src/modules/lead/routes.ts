import { Router } from "express";
import { getLeadsController } from "./controller.js";

export const leadRoutes = Router();
leadRoutes.get("/", getLeadsController);
