import { Router } from "express";
import { createWhatsAppInstanceController } from "./controllers.js";

export const whatsappRoutes = Router();

whatsappRoutes.post("/create-instance", createWhatsAppInstanceController);
