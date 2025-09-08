import type { ILeadRepository } from '../domain/repository/ILeadRepository.js';
import { prisma } from '../../../infra/database/Prisma.js';
import type { GetLeadByPhoneDto } from '../domain/dtos/GetLeadByPhoneDto.js';

import type { CreateLeadDto } from '../domain/dtos/CreateLeadDto.js';
import type { UpdateLeadDto } from '../domain/dtos/UpdateLeadDto.js';

class LeadRepository implements ILeadRepository {
  public async get() {
    const lead = await prisma.lead.findMany({
      include: { matches: true },
      orderBy: { created_at: 'desc' },
    });
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
