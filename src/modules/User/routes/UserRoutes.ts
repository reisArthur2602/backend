import { Router } from 'express';

import { authMiddleware } from '../../../shared/http/middleware/auth.js';
import UserController from '../controller/UserController.js';

export const userRoutes = Router();

const userController = new UserController();

userRoutes.post('/create', userController.create);
userRoutes.post('/session', userController.session);
userRoutes.get('/me', authMiddleware, userController.details);
