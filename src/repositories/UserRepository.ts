import { prisma } from "../lib/prisma.js";

class UserRepository {
  public async getbyEmail(input: { email: string }) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });
    return user;
  }

  public async getbyId(input: { id: string }) {
    const user = await prisma.user.findUnique({ where: { id: input.id } });
    return user;
  }

  public async create(input: {
    email: string;
    name: string;
    password: string;
  }) {
    const user = await prisma.user.create({ data: input });
    return user;
  }
}

export default UserRepository;
