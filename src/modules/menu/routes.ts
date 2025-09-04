import { Router } from "express";
import {
  createMenuController,
  deleteMenuController,
  editMenuController,
  getMenusController,
} from "./controllers.js";

export const menuRoutes = Router();

menuRoutes.get("/", getMenusController);
menuRoutes.delete("/:menu_id", deleteMenuController);

menuRoutes.put("/fodase/:menu_id", editMenuController);
menuRoutes.post("/create", createMenuController);
