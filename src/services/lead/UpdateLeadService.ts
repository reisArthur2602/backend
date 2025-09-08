import LeadRepository from '../../repositories/LeadRepository.js';
import { ConflictError } from '../../utils/error-handlers.js';

interface IUpdateLeadService {
  phone: string;
  name?: string;
}

class UpdateLeadService {
  private leadRepository: LeadRepository;

  constructor() {
    this.leadRepository = new LeadRepository();
  }

  public async execute(data: IUpdateLeadService) {
    const leadExists = await this.leadRepository.getbyPhone({ phone: data.phone });

    if (!leadExists) {
      throw new ConflictError('O contato não foi encontrado');
    }

    const lead = await this.leadRepository.update(data);

    return lead;
  }
}

export default UpdateLeadService;
