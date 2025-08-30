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

import { customers } from "../cache/customers.js";
import { MENU } from "../cache/menu.js";

const INSTANCES_PATH = path.resolve("./instances");

interface IStartInstanceBaileys {
  instance_id: string;
}

// --- helper para salvar logs ---
function logMessage(
  phone: string,
  from: "customer" | "menu" | "agent",
  state: string,
  text: string
) {
  const current = customers.get(phone);

  if (!current) return;

  const newMessage = { phone, from, state: state as any, text };
  const messages = current.messages ?? [];
  messages.push(newMessage);

  customers.set(phone, { ...current, messages });
}
// -------------------------------

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
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message || msg?.key.fromMe) return;

    const phone = msg.key.remoteJid!;
    const text = msg.message.conversation || "";
    const name = msg.pushName || "";

    let currentCustomer = customers.get(phone);
    if (!currentCustomer) {
      currentCustomer = { name, phone, state: "idle", messages: [] };
      customers.set(phone, currentCustomer);
    }

    // Log da mensagem do cliente
    logMessage(phone, "customer", currentCustomer.state, text);

    switch (currentCustomer.state) {
      case "idle": {
        const menu = MENU.find((m) =>
          m.keywords.some((k) => text.toLowerCase().trim().includes(k))
        );

        if (!menu) {
          const reply = "Nenhum gatilho encontrado";
          await sock.sendMessage(phone, { text: reply });
          logMessage(phone, "menu", currentCustomer.state, reply);
          return;
        }

        await sock.sendMessage(phone, { text: menu.message });
        logMessage(phone, "menu", currentCustomer.state, menu.message);

        customers.set(phone, { ...currentCustomer, state: "await_option" });
        break;
      }

      case "await_option": {
        const parseText = Number(text.trim());

        if (!parseText) {
          const reply = "Por favor, escolha algumas das opções";
          await sock.sendMessage(phone, { text: reply });
          logMessage(phone, "menu", currentCustomer.state, reply);
          return;
        }

        const option = MENU[0]?.options.find((o) => o.trigger === parseText);

        if (!option) {
          const reply = "Por favor, escolha algumas das opções";
          await sock.sendMessage(phone, { text: reply });
          logMessage(phone, "menu", currentCustomer.state, reply);
          return;
        }

        if (option.action === "AUTO_REPLY") {
          await sock.sendMessage(phone, { text: option.reply_text! });
          logMessage(phone, "menu", currentCustomer.state, option.reply_text!);

          customers.set(phone, { ...currentCustomer, state: "idle" });
          return;
        }

        if (option.action === "REDIRECT_QUEUE") {
          const reply =
            "🙋 Você foi adicionado à fila de atendimento. Aguarde um atendente.";
          await sock.sendMessage(phone, { text: reply });
          logMessage(phone, "menu", currentCustomer.state, reply);

          // Emitir para frontend do atendente
          io.emit("new_customer", {
            phone: currentCustomer.phone,
            name: currentCustomer.name,
            messages: currentCustomer.messages,
          });

          // Persistência opcional no banco
          // const chat = await prisma.chat.create({ ... });

          customers.set(phone, { ...currentCustomer, state: "in_queue" });
        }
        break;
      }

      case "in_queue": {
        const reply = "🙋 Você está na fila, aguardando um atendente.";
        await sock.sendMessage(phone, { text: reply });
        logMessage(phone, "menu", currentCustomer.state, reply);
        break;
      }

      case "in_service": {
        // Mensagem do cliente para chat em tempo real
        logMessage(phone, "customer", currentCustomer.state, text);

        // Emitir para atendente via Socket.IO
        io.to(`chat_${phone}`).emit("new_message", {
          from: "customer",
          text,
          phone,
          state: currentCustomer.state,
        });
        break;
      }
    }
  });

  io.on("connection", (socket) => {
    // Atendente clica "Iniciar Atendimento"
    socket.on("start_service", async ({ phone }) => {
      const currentCustomer = customers.get(phone);
      if (!currentCustomer) return;

      // Atualiza estado
      currentCustomer.state = "in_service";
      customers.set(phone, currentCustomer);

      // Cria sala para o chat
      socket.join(`chat_${phone}`);

      // Envia histórico completo para atendente
      socket.emit("open_chat", {
        phone: currentCustomer.phone,
        name: currentCustomer.name,
        messages: currentCustomer.messages,
      });

      // Atualiza no banco se quiser
      // await prisma.chat.update({ where: { id: chatId }, data: { state: "in_service" } });
    });

    // Recebe mensagem do atendente
    socket.on("send_message", async ({ phone, text }) => {
      const currentCustomer = customers.get(phone);
      if (!currentCustomer) return;

      // Log da mensagem do atendente
      logMessage(phone, "agent", currentCustomer.state, text);

      // Envia para o cliente via WhatsApp
      await sock.sendMessage(phone, { text });

      // Emitir para o atendente (broadcast para a sala)
      io.to(`chat_${phone}`).emit("new_message", {
        from: "agent",
        text,
        phone,
        state: currentCustomer.state,
      });

      // Persistir no banco se necessário
      // await prisma.message.create({ data: { chatId, from: "agent", text, state: currentCustomer.state } });
    });

    // Finalizar atendimento
    socket.on("finish_service", async ({ phone }) => {
      const currentCustomer = customers.get(phone);
      if (!currentCustomer) return;

      currentCustomer.state = "finished";
      customers.delete(phone);

      socket.to(`chat_${phone}`).emit("chat_finished", { phone });
    });
  });

  sock.ev.on("creds.update", saveCreds);
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
