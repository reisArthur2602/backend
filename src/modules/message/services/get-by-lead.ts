import { prisma } from "../../../lib/prisma.js";
import { NotFoundError } from "../../../utils/error-handlers.js";

interface IGetMessageByLead {
  lead_id: string;
}

export const getMessageByLead = async ({ lead_id }: IGetMessageByLead) => {
  try {
    const messages = await prisma.message.findMany({
      where: { leadId: lead_id },
      orderBy: { created_at: "desc" },
    });

    return messages;
  } catch (error) {
    throw new NotFoundError("O contato não foi encontrado");
  }
};
