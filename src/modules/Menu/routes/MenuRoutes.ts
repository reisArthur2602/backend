import { Router } from 'express';
import MenuController from '../controller/MenuController.js';

export const menuRoutes = Router();

const menuController = new MenuController();

menuRoutes.get('/', menuController.get);
menuRoutes.delete('/:menu_id', menuController.delete);
menuRoutes.put('/:menu_id', menuController.update);
menuRoutes.post('/create', menuController.create);
