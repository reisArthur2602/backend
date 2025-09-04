import path from "path";
import fs from "fs";
import qrcode from "qrcode-terminal";
import {
  useMultiFileAuthState,
  makeWASocket,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { prisma } from "./prisma.js";
import { io } from "../http/server.js";

import { type LeadState, type MessageFrom } from "@prisma/client";
import { getLeadsService } from "../modules/lead/services/get.js";
import { normalizeText } from "../utils/normalize-text.js";

type MessageInMemory = {
  created_at: Date;
  text: string;
  from: MessageFrom;
};

type LeadInMemory = {
  id: string;
  name: string | null;
  state: LeadState;
  phone: string;
  messages: MessageInMemory[];
  menu_id: string | null;
};
const leads = new Map<string, LeadInMemory>();

const formatPhoneFromJid = (remoteJid?: string) => {
  if (!remoteJid) return "";
  const id = remoteJid.split("@")[0];

  return id?.startsWith("+") ? id : `+${id}`;
};

const INSTANCES_PATH = path.resolve("./instances");

const ensureInstanceDir = (instancePath: string) => {
  if (!fs.existsSync(instancePath))
    fs.mkdirSync(instancePath, { recursive: true });
};

const getLead = async ({
  phone,
  pushName,
}: {
  phone: string;
  pushName: string;
}) => {
  const currentLead = leads.get(phone);
  if (currentLead) return currentLead;

  const dbLead = await prisma.lead.findUnique({
    where: { phone },
    select: {
      id: true,
      name: true,
      state: true,
      phone: true,
      messages: { select: { created_at: true, from: true, text: true } },
    },
  });

  if (dbLead) {
    const lead = { ...dbLead, menu_id: null, messages: dbLead.messages ?? [] };
    leads.set(phone, lead);
    return lead;
  }

  const lead = await prisma.lead.create({
    data: {
      phone,
      name: pushName ?? null,
    },
    select: {
      id: true,
      name: true,
      state: true,
      phone: true,
    },
  });

  const newLead: LeadInMemory = {
    id: lead.id,
    name: pushName ?? null,
    phone,
    state: lead.state,
    menu_id: null,
    messages: [],
  };

  leads.set(phone, newLead);

  return newLead;
};

export const startBaileysInstance = async ({
  instance_id,
}: {
  instance_id: string;
}) => {
  const instancePath = path.join(INSTANCES_PATH, instance_id);
  ensureInstanceDir(instancePath);

  const { state, saveCreds } = await useMultiFileAuthState(instancePath);
  const sock = makeWASocket({ auth: state });

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
      case "close": {
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
        await startBaileysInstance({ instance_id });
        break;
      }
    }

    io.emit(`status:${instance_id}`, status);

    io.on("connection", async (socket) => {
      socket.emit(`qr:${instance_id}`, qr);
      socket.emit(`status:${instance_id}`, status);
    });
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const msg = messages[0];
      if (!msg?.message || msg?.key?.fromMe) return;

      const pushName = msg.pushName || "";

      const phone = msg.key.remoteJid!;
      console.log(phone);
      const text =
        msg.message.conversation ||
        msg.message?.extendedTextMessage?.text ||
        "";

      const currentLead = await getLead({ phone, pushName });
      const now = new Date();

      currentLead.messages.push({ from: "customer", created_at: now, text });
      leads.set(phone, currentLead);

      if (
        currentLead.state === "in_queue" ||
        currentLead.state === "in_service"
      ) {
        io.emit("receive_message", phone, text);

        await prisma.message.create({
          data: {
            from: "customer",
            text,
            leadId: currentLead.id,
          },
        });
        return;
      }

      switch (currentLead.state) {
        case "idle": {
          const normalizedText = normalizeText(text);
          const menus = await prisma.menu.findMany({
            where: { active: true },
            select: {
              id: true,
              keywords: true,
              message: true,
              _count: { select: { options: true } },
            },
          });

          const menuFound = menus.find((menu) =>
            menu.keywords.some((keyword) =>
              normalizedText.includes(normalizeText(keyword))
            )
          );

          if (!menuFound) break;

          if ((menuFound._count?.options ?? 0) === 0) {
            await sock.sendMessage(phone, { text: menuFound.message });
            currentLead.messages.push({
              from: "menu",
              created_at: now,
              text: menuFound.message,
            });
            currentLead.state = "idle";
            leads.set(phone, currentLead);
            break;
          }

          await sock.sendMessage(phone, { text: menuFound.message });
          currentLead.messages.push({
            from: "menu",
            created_at: now,
            text: menuFound.message,
          });
          currentLead.menu_id = menuFound.id;
          currentLead.state = "await_option";
          leads.set(phone, currentLead);
          break;
        }

        case "await_option": {
          const trigger = Number(text.trim());

          if (!trigger) {
            const reply =
              "Por favor, escolha uma das opções (digite o número).";
            await sock.sendMessage(phone, { text: reply });
            currentLead.messages.push({
              from: "menu",
              created_at: now,
              text: reply,
            });
            leads.set(phone, currentLead);
            return;
          }

          const optionFound = await prisma.menuOption.findFirst({
            where: { menu_id: currentLead.menu_id!, trigger },
            select: {
              id: true,
              label: true,
              trigger: true,
              action: true,
              payload: true,
            },
          });

          if (!optionFound) {
            const reply =
              "Opção inválida. Por favor, escolha uma das opções listadas.";
            await sock.sendMessage(phone, { text: reply });
            currentLead.messages.push({
              from: "menu",
              created_at: now,
              text: reply,
            });
            leads.set(phone, currentLead);
            break;
          }

          const action = optionFound.action;
          const payload = optionFound.payload ?? {};

          switch (action) {
            case "auto_reply": {
              const replyText = payload.reply_text;

              await sock.sendMessage(phone, { text: replyText });
              currentLead.messages.push({
                from: "menu",
                created_at: now,
                text: replyText,
              });

              currentLead.state = "idle";
              currentLead.menu_id = null;
              leads.set(phone, currentLead);

              await prisma.lead.update({
                where: { id: currentLead.id },
                data: {
                  state: "idle",
                  messages: { createMany: { data: currentLead.messages } },
                },
              });
              break;
            }

            case "forward_to_number": {
              const forwardTo = payload.forward_to_numbe;
              const finishText = payload.finish_text;
              const forwardMessageContent = payload.forward_text;

              await sock.sendMessage(`${forwardTo}@s.whatsapp.net`, {
                text: `Encaminhado de ${formatPhoneFromJid(
                  phone
                )}:\n\n${forwardMessageContent}`,
              });

              await sock.sendMessage(phone, { text: finishText });
              currentLead.messages.push({
                from: "menu",
                created_at: now,
                text: finishText,
              });

              currentLead.state = "idle";
              currentLead.menu_id = null;
              leads.set(phone, currentLead);

              await prisma.lead.update({
                where: { id: currentLead.id },
                data: {
                  state: "idle",
                  messages: { createMany: { data: currentLead.messages } },
                },
              });
              break;
            }

            case "redirect_queue": {
              const reply = payload.reply_text;
              await sock.sendMessage(phone, { text: reply });
              currentLead.messages.push({
                from: "menu",
                created_at: now,
                text: reply,
              });
              currentLead.state = "in_queue";
              leads.set(phone, currentLead);

              io.emit("newLead", {
                id: currentLead.id,
                name: currentLead.name,
                phone: currentLead.phone,
                state: currentLead.state,
                lastMessage: currentLead.messages[0] ?? null,
                count: currentLead.messages.length ?? 0,
              });

              await prisma.lead.update({
                where: { id: currentLead.id },
                data: {
                  state: `in_queue`,
                  messages: {
                    createMany: {
                      data: currentLead.messages.map((m) => ({
                        text: m.text,
                        from: m.from,
                        created_at: m.created_at,
                      })),
                      skipDuplicates: true,
                    },
                  },
                },
              });

              break;
            }
          }

          break;
        }
      }
    } catch (err) {
      console.error("messages.upsert handler error:", err);
    }
  });

  sock.ev.on("creds.update", saveCreds);

  io.on("connection", async (socket) => {
    const queue = await getLeadsService();
    socket.emit("queue", queue);

    socket.on("send_message", async (phone, text) => {
      const currentLead = leads.get(phone);
      if (!currentLead) return null;

      await sock.sendMessage(phone, { text });
      await prisma.message.create({
        data: {
          from: "agent",
          text,
          leadId: currentLead.id,
        },
      });
    });
  });
  
  return sock;
};
