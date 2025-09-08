import { Router } from 'express';
import MenuOptionController from '../controller/MenuOptionController.js';

export const menuOptionRoutes = Router();

const menuOptionController = new MenuOptionController();

menuOptionRoutes.post('/create', menuOptionController.create);
menuOptionRoutes.delete('/:option_id', menuOptionController.delete);
menuOptionRoutes.get('/', menuOptionController.get);
