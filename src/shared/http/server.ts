import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import http from 'http';

import { errorsMiddleware } from './middleware/errors.js';

import { setupSocket } from '../../lib/socket-io.js';

import { bootstrap } from './main.js';
import { userRoutes } from '../../routes/UserRoutes.js';
import { menuRoutes } from '../../routes/MenuRoutes.js';
import { leadRoutes } from '../../routes/LeadRoutes.js';
import { menuOptionRoutes } from '../../routes/MenuOptionRoutes.js';

const PORT = Number(process.env.PORT) || 8080;
const app = express();

const server = http.createServer(app);

export const io = setupSocket({ server });

bootstrap();

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
});
