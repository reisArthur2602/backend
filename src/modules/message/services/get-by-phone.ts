import { prisma } from "../../../lib/prisma.js";
import { NotFoundError } from "../../../utils/error-handlers.js";

interface IGetMessageByPhone {
  phone: string;
}

export const getMessageByPhone = async ({ phone }: IGetMessageByPhone) => {
  try {
    const messages = await prisma.message.findMany({
      where: { lead: { phone } },
      orderBy: { created_at: "asc" },
      select: {
        text: true,
        from: true,
        created_at: true,
      },
    });

    return messages;
  } catch (error) {
    throw new NotFoundError("Nenhum usuário foi encontrado");
  }
};
