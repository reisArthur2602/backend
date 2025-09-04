import { Router } from "express";
import {
  createOptionController,
  deleteOptionController,
  getOptionsController,
} from "./controller.js";

export const optionRoutes = Router();

optionRoutes.post("/create", createOptionController);
optionRoutes.delete("/:option_id", deleteOptionController);
optionRoutes.get("/", getOptionsController);
