import { Router } from "express";
import { createUserController } from "./controller.js";

const userRoutes = Router();

userRoutes.post("/create", createUserController);
userRoutes.post("/session", () => {});
userRoutes.get("/", () => {});

export { userRoutes };
