import type { Lead } from '@prisma/client';
import type { GetLeadByPhoneDto } from '../models/lead/GetLeadByPhoneDto.js';
import type { CreateLeadDto } from '../models/lead/CreateLeadDto.js';
import type { UpdateLeadDto } from '../models/lead/UpdateLeadDto.js';

export interface ILeadRepository {
  get: () => Promise<Lead[] | []>;
  getbyPhone: (data: GetLeadByPhoneDto) => Promise<Lead | null>;
  create: (data: CreateLeadDto) => Promise<Lead>;
  update: (data: UpdateLeadDto) => Promise<Lead>;
}
