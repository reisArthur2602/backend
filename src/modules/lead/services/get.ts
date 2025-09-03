import { prisma } from "../../../lib/prisma.js";

export const getLeadsService = async () => {
  const leads = await prisma.lead.findMany({
    where: { state: { in: ["in_service", "in_queue"] } },
    select: {
      id: true,
      name: true,
      phone: true,
      state: true,

      messages: {
        take: 1,
        orderBy: { created_at: "desc" },
        select: {
          text: true,
          created_at: true,
        },
      },

      _count: { select: { messages: true } },
    },
  });

  return leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    state: lead.state,
    lastMessage: lead.messages[0] ?? null,
    count: lead._count?.messages ?? 0,
  }));
};
