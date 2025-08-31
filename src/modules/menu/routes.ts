import { Router } from "express";
import { createMenuController } from "./controllers.js";

export const menuRoutes = Router();

menuRoutes.post("/create", createMenuController);
