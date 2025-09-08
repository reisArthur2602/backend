import type { IMatchRepository } from '../domain/repository/IMatchRepository.js';
import { prisma } from '../../../infra/database/Prisma.js';
import type { CreateMatchDto } from '../domain/dtos/CreateMatchDto.js';

export default class MatchRepository implements IMatchRepository {
  public async create(data: CreateMatchDto) {
    const match = await prisma.match.create({ data });
    return match;
  }
}
