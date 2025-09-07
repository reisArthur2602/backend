import LeadRepository from '../../repositories/LeadRepository.js';
import { ConflictError } from '../../utils/error-handlers.js';

interface ICreateLeadService {
  phone: string;
  name: string;
}

class CreateLeadService {
  private leadRepository: LeadRepository;

  constructor() {
    this.leadRepository = new LeadRepository();
  }

  public async execute(data: ICreateLeadService) {
    const leadExists = await this.leadRepository.getbyPhone({ phone: data.phone });

    if (leadExists) {
      throw new ConflictError('Já existe um contato salvo com este número');
    }

    const lead = await this.leadRepository.create(data);

    return lead;
  }
}

export default CreateLeadService;
