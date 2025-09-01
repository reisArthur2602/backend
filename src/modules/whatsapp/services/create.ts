import { instances, startBaileysInstance } from "../../../lib/baileys.js";
import { prisma } from "../../../lib/prisma.js";

export const createWhatsAppInstanceService = async () => {
  const instance_id = crypto.randomUUID();

  await prisma.whatsAppInstance.create({
    data: { instance_id },
  });

  instances.set(instance_id, {
    instance_id,
    status: "pending",
  });

  await startBaileysInstance({ instance_id });
};
