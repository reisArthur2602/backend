import type { Lead, Prisma } from '@prisma/client';
import type { GetLeadByPhoneDto } from '../dtos/GetLeadByPhoneDto.js';
import type { CreateLeadDto } from '../dtos/CreateLeadDto.js';
import type { UpdateLeadDto } from '../dtos/UpdateLeadDto.js';

export interface ILeadRepository {
  get: () => Promise<Prisma.LeadGetPayload<{ include: { matches: true } }>[] | []>;
  getbyPhone: (data: GetLeadByPhoneDto) => Promise<Lead | null>;
  create: (data: CreateLeadDto) => Promise<Lead>;
  update: (data: UpdateLeadDto) => Promise<Lead>;
}
