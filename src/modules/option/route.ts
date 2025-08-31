import { Router } from "express";
import { createOptionController } from "./controller.js";

export const optionRoutes = Router();

optionRoutes.post("/create", createOptionController);
