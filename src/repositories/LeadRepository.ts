import type { ILeadRepository } from '../domains/repositories/ILeadRepository.js';
import { prisma } from '../lib/prisma.js';
import type { GetLeadByPhoneDto } from '../domains/models/lead/GetLeadByPhoneDto.js';

import type { CreateLeadDto } from '../domains/models/lead/CreateLeadDto.js';
import type { UpdateLeadDto } from '../domains/models/lead/UpdateLeadDto.js';

class LeadRepository implements ILeadRepository {
  public async get() {
    const lead = await prisma.lead.findMany();
    return lead;
  }

  public async getbyPhone(data: GetLeadByPhoneDto) {
    const lead = await prisma.lead.findUnique({
      where: {
        phone: data.phone,
      },
    });
    return lead;
  }

  public async create(data: CreateLeadDto) {
    const lead = await prisma.lead.create({ data });
    return lead;
  }

  public async update({ phone, ...data }: UpdateLeadDto) {
    const lead = await prisma.lead.update({ where: { phone }, data });
    return lead;
  }
}

export default LeadRepository;
