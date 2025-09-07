import type { Lead } from '@prisma/client';
import LeadRepository from '../../repositories/LeadRepository.js';
import type { IRedisCache } from '../../shared/cache/RedisCache.js';
import RedisCache from '../../shared/cache/RedisCache.js';
interface IGetLeadBYPhoneService {
  phone: string;
}

class GetLeadByPhoneService {
  private leadRepository: LeadRepository;
  private redisCache: IRedisCache;

  constructor() {
    this.leadRepository = new LeadRepository();
    this.redisCache = new RedisCache();
  }

  public async execute({ phone }: IGetLeadBYPhoneService) {
    let lead = await this.redisCache.recover<Lead | null>({ key: `lead:${phone}` });
    if (lead) return lead;

    lead = await this.leadRepository.getbyPhone({ phone });
    return lead;
  }
}

export default GetLeadByPhoneService;
