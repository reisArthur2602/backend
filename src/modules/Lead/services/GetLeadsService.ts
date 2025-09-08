import type { ILeadRepository } from '../domain/repository/ILeadRepository.js';
import LeadRepository from '../repository/LeadRepository.js';

class GetLeadsService {
  private leadRepository: ILeadRepository;

  constructor() {
    this.leadRepository = new LeadRepository();
  }

  public async execute() {
    const leads = await this.leadRepository.get();
    return leads;
  }
}

export default GetLeadsService;
