import LeadRepository from '../../repositories/LeadRepository.js';

class GetLeadsService {
  private leadRepository: LeadRepository;

  constructor() {
    this.leadRepository = new LeadRepository();
  }

  public async execute() {
    const leads = await this.leadRepository.get();
    return leads;
  }
}

export default GetLeadsService;
