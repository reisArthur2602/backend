import { prisma } from "../../../lib/prisma.js";

export const getLeadsService = async () => {
  const leads = await prisma.lead.findMany({
    where: { OR: [{ state: "in_service" }, { state: "in_queue" }] },
    include: { messages: { orderBy: { created_at: "asc" } } },
  });

  return leads;
};
