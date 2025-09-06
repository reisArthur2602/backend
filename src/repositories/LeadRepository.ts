import { prisma } from "../lib/prisma.js";

class LeadRepository {
  public async get() {
    const lead = await prisma.lead.findMany();
    return lead;
  }

  public async getByPhone(input: { phone: string }) {
    const lead = await prisma.lead.findUnique({
      where: {
        phone: input.phone,
      },
    });
    return lead;
  }
}

export default LeadRepository;
