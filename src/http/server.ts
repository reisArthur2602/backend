import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";

import { userRoutes } from "../modules/user/routes.js";
import { errorsMiddleware } from "./middleware/errors.js";
import { setupSocket } from "../lib/socket-io.js";

import { startBaileysInstance } from "../lib/baileys.js";
import { menuRoutes } from "../modules/menu/routes.js";
import { optionRoutes } from "../modules/option/route.js";
import { leadRoutes } from "../modules/lead/routes.js";
import { messageRoute } from "../modules/message/route.js";
import { bootstrap } from "./main.js";

const PORT = Number(process.env.PORT) || 8080;
const app = express();

const server = http.createServer(app);

export const io = setupSocket({ server });
bootstrap(io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


app.use("/user", userRoutes);
app.use("/menu", menuRoutes);
app.use("/menu/option", optionRoutes);
app.use("/lead", leadRoutes);
app.use("/message", messageRoute);

app.use(errorsMiddleware);

server.listen(PORT, () => {
  console.log(`👽 Server rodando na Porta:${PORT}`);
});
