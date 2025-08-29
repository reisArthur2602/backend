import { Router } from "express";

import {
  createUserController,
  detailsUserController,
  sessionUserController,
} from "./controller.js";

import { authMiddleware } from "../../http/middleware/auth.js";

const userRoutes = Router();

userRoutes.post("/create", createUserController);
userRoutes.post("/session", sessionUserController);
userRoutes.get("/me", authMiddleware, detailsUserController);

export { userRoutes };
