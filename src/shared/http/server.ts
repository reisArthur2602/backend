import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import http from 'http';

import { errorsMiddleware } from './middleware/errors.js';

import { setupSocket } from '../../infra/Socket/SocketSetup.js';

import { bootstrap } from './main.js';
import { userRoutes } from '../../modules/User/routes/UserRoutes.js';
import { menuRoutes } from '../../modules/Menu/routes/MenuRoutes.js';
import { leadRoutes } from '../../modules/Lead/routes/LeadRoutes.js';
import { menuOptionRoutes } from '../../modules/MenuOption/routes/MenuOptionRoutes.js';

const PORT = Number(process.env.PORT) || 8080;
const app = express();

const server = http.createServer(app);

export const io = setupSocket({ server });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/user', userRoutes);
app.use('/menu', menuRoutes);
app.use('/menu/option', menuOptionRoutes);
app.use('/lead', leadRoutes);

app.use(errorsMiddleware);

server.listen(PORT, () => {
  console.log(`👽 Server rodando na Porta:${PORT}`);
  bootstrap();
});
