import type { Lead, Prisma } from '@prisma/client';
import type { GetLeadByPhoneDto } from '../dtos/lead/GetLeadByPhoneDto.js';
import type { CreateLeadDto } from '../dtos/lead/CreateLeadDto.js';
import type { UpdateLeadDto } from '../dtos/lead/UpdateLeadDto.js';

export interface ILeadRepository {
  get: () => Promise<Prisma.LeadGetPayload<{ include: { matches: true } }>[] | []>;
  getbyPhone: (data: GetLeadByPhoneDto) => Promise<Lead | null>;
  create: (data: CreateLeadDto) => Promise<Lead>;
  update: (data: UpdateLeadDto) => Promise<Lead>;
}
