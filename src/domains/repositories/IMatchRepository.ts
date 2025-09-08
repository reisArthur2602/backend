import type { Match } from '@prisma/client';
import type { CreateMatchDto } from '../dtos/match/CreateMatchDto.js';

export interface IMatchRepository {
  create: (data: CreateMatchDto) => Promise<Match>;
}
