import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";

import { userRoutes } from "../modules/user/routes.js";
import { errorsMiddleware } from "./middleware/errors.js";
import { setupSocket } from "../lib/socket-io.js";
import { whatsappRoutes } from "../modules/whatsapp/routes.js";
import { loadStartupBaileysInstances } from "../lib/baileys.js";
import { menuRoutes } from "../modules/menu/routes.js";
import { optionRoutes } from "../modules/option/route.js";

const PORT = Number(process.env.PORT) || 8080;
const app = express();
const server = http.createServer(app);

export const io = setupSocket({ server });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/ping", (req, res) => {
  res.sendStatus(200);
});

app.use("/user", userRoutes);
app.use("/whatsapp", whatsappRoutes);
app.use("/menu", menuRoutes);
app.use("/menu/option", optionRoutes);

app.use(errorsMiddleware);

server.listen(PORT, async () => {
  console.log(`👽 Server rodando na Porta:${PORT}`);
  await loadStartupBaileysInstances();
});
