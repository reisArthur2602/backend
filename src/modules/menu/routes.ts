import { Router } from "express";
import { createMenuController, getAllMenusController } from "./controllers.js";

export const menuRoutes = Router();

menuRoutes.post("/create", createMenuController);
menuRoutes.get("/", getAllMenusController);
