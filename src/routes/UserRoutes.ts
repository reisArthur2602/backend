import { Router } from 'express';

import UserController from '../controllers/UserController.js';
import { authMiddleware } from '../shared/http/middleware/auth.js';


export const userRoutes = Router();

const userController = new UserController();

userRoutes.post('/create', userController.create);
userRoutes.post('/session', userController.session);
userRoutes.get('/me', authMiddleware, userController.details);
