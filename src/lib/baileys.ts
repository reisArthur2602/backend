import path from "path";
import fs from "fs";
import qrcode from "qrcode-terminal";

import {
  useMultiFileAuthState,
  makeWASocket,
  DisconnectReason,
} from "@whiskeysockets/baileys";

import { Boom } from "@hapi/boom";
import { instances } from "../cache/instances.js";
import { prisma } from "./prisma.js";
import { NotFoundError } from "../utils/error-handlers.js";

import { io } from "../http/server.js";

const INSTANCES_PATH = path.resolve("./instances");

interface IStartInstanceBaileys {
  instance_id: string;
}

export const startBaileysInstance = async ({
  instance_id,
}: IStartInstanceBaileys) => {
  const instancePath = path.join(INSTANCES_PATH, instance_id);

  if (!fs.existsSync(instancePath))
    fs.mkdirSync(instancePath, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(instancePath);

  const sock = makeWASocket({ auth: state });

  const instance = instances.get(instance_id);
  if (!instance) throw new NotFoundError("A instância não foi encontrada");

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    let status: "pending" | "active" = "pending";

    if (qr) {
      qrcode.generate(qr, { small: true });
      io.emit(`qr:${instance_id}`, qr);
    }

    switch (connection) {
      case "connecting":
        status = "pending";
        break;

      case "open":
        status = "active";
        break;

      case "close":
        const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;

        if (
          reason === DisconnectReason.loggedOut ||
          reason === DisconnectReason.connectionLost
        ) {
          fs.rmSync(path.join(INSTANCES_PATH, instance_id), {
            recursive: true,
            force: true,
          });
        }

        instances.set(instance_id, { ...instance, status });

        await startBaileysInstance({ instance_id });

        break;
    }

    instances.set(instance_id, { ...instance, status, socket: sock });
    io.emit(`status:${instance_id}`, status);

    await prisma.whatsAppInstance.update({
      where: { instance_id },
      data: { status },
    });

    sock.ev.on("creds.update", saveCreds);
  });

  return sock;
};

export const loadStartupBaileysInstances = async () => {
  const dbInstances = await prisma.whatsAppInstance.findMany();

  for (const dbInstance of dbInstances) {
    instances.set(dbInstance.instance_id, {
      instance_id: dbInstance.instance_id,
      status: dbInstance.status as "pending" | "active",
    });

    await startBaileysInstance({ instance_id: dbInstance.instance_id });
  }
};
