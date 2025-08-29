import { startBaileysInstance } from "../../../lib/baileys.js";
import { instances } from "../../../cache/instances.js";
import { prisma } from "../../../lib/prisma.js";
import { setupSocket } from "../../../lib/socket-io.js";
import { ConflictError } from "../../../utils/error-handlers.js";

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
