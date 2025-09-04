import { Router } from "express";
import {
  createMenuController,
  deleteMenuController,
  getMenusController,
} from "./controllers.js";

export const menuRoutes = Router();

menuRoutes.get("/", getMenusController);
menuRoutes.delete("/:menu_id", deleteMenuController);
menuRoutes.post("/create", createMenuController);
