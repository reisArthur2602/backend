import { Router } from 'express';
import LeadController from '../controller/LeadController.js';

export const leadRoutes = Router();

const leadController = new LeadController();

leadRoutes.get('/', leadController.get);
