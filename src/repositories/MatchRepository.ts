import type { CreateMatchDto } from '../domains/dtos/match/CreateMatchDto.js';
import type { IMatchRepository } from '../domains/repositories/IMatchRepository.js';
import { prisma } from '../lib/prisma.js';

export default class MatchRepository implements IMatchRepository {
  public async create(data: CreateMatchDto) {
    const match = await prisma.match.create({ data });
    return match;
  }
}
