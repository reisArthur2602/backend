import type { LeadState } from '@prisma/client';

export interface UpdateLeadDto {
  phone: string;
  name?: string;
  state?: LeadState;
}
