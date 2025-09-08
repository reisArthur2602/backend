import type { Request, Response } from 'express';
import GetLeadsService from '../services/lead/GetLeadsService.js';

export default class LeadController {
  async get(request: Request, response: Response) {
    const getLeadsService = new GetLeadsService();
    const leads = await getLeadsService.execute();

    return response.status(200).json(leads);
  }
}
