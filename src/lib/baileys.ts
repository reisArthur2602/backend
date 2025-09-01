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
import { NotFoundError } from "../utils/error-handlers.js";

import { io } from "../http/server.js";

// Cache in-memory (Map) — pode substituir por Redis fácil depois
// key: phone -> value: { name, phone, state, messages: {from,text,createdAt}[], leadId? }

import { type WASocket } from "@whiskeysockets/baileys";

export type WhatsAppInstance = {
  instance_id: string;
  status: "pending" | "active" | "disconnected";
  socket?: WASocket;
};

export const instances: Map<string, WhatsAppInstance> = new Map();
const customers = new Map<string, any>();

import { MENU } from "../cache/menu.js";

const INSTANCES_PATH = path.resolve("./instances");

/**
 * Busca no cache -> se não existe busca no DB -> se não existe cria memória (não salva no DB ainda)
 */
async function getOrCreateCustomer(phone: string, pushName?: string) {
  let current = customers.get(phone);
  if (current) return current;

  // tentar buscar no banco
  const dbLead = await prisma.lead.findUnique({
    where: { phone },
    include: { messages: { orderBy: { created_at: "asc" } } },
  });

  if (dbLead) {
    const mem = {
      name: dbLead.name ?? pushName ?? "",
      phone,
      state: dbLead.state as string,
      messages: dbLead.messages.map((m) => ({
        from: m.from,
        text: m.text,
        createdAt: m.created_at,
      })),
      leadId: dbLead.id,
    };
    customers.set(phone, mem);
    return mem;
  }

  // cria novo em memória (ainda não persiste no DB)
  const newMem = {
    name: pushName ?? "",
    phone,
    state: "idle",
    messages: [] as any[],
  };
  customers.set(phone, newMem);
  return newMem;
}

/**
 * Registra mensagem em memória. Se o lead estiver in_queue ou in_service,
 * também persiste imediatamente no banco.
 */
async function logMessage(
  phone: string,
  from: "customer" | "menu" | "agent",
  text: string
) {
  const current = customers.get(phone);
  if (!current) return;

  const now = new Date();
  const newMsg = { from, text, createdAt: now };

  // salva em memória
  current.messages = current.messages ?? [];
  current.messages.push(newMsg);
  customers.set(phone, current);

  // Se já tem leadId e está em fila/serviço, salva imediatamente
  if (current.state === "in_queue" || current.state === "in_service") {
    // garante lead no DB
    if (!current.leadId) {
      // cria lead se não existir
      const lead = await prisma.lead.upsert({
        where: { phone },
        update: { name: current.name ?? undefined, state: current.state },
        create: { phone, name: current.name, state: current.state },
      });
      current.leadId = lead.id;
      customers.set(phone, current);
    }

    await prisma.message.create({
      data: {
        text,
        from,
        leadId: current.leadId,
      },
    });
  }
}

/**
 * Quando o cliente é redirecionado para a fila: persistir todo histórico
 * (memória -> DB), criar lead se necessário e emitir socket "new_customer".
 */
async function persistMessagesAndCreateLead(phone: string) {
  const current = customers.get(phone);
  if (!current) return null;

  // Se já existe leadId, só cria mensagens
  let leadId = current.leadId;
  if (!leadId) {
    const lead = await prisma.lead.upsert({
      where: { phone },
      update: { name: current.name ?? undefined, state: "in_queue" },
      create: { phone, name: current.name, state: "in_queue" },
    });
    leadId = lead.id;
    current.leadId = leadId;
    customers.set(phone, current);
  } else {
    // garante estado no DB
    await prisma.lead.update({
      where: { id: leadId },
      data: { state: "in_queue" },
    });
  }

  // salvar mensagens pendentes (se houver)
  const toSave = (current.messages ?? []).map((m: any) => ({
    text: m.text,
    from: m.from,
    leadId,
  }));

  if (toSave.length) {
    // createMany
    await prisma.message.createMany({
      data: toSave,
    });
  }

  // zera mensagens em memória (manter histórico local opcional)
  current.messages = [];
  customers.set(phone, current);

  // retornar chat com mensagens recém criadas (caso queira enviar ao front)
  const messages = await prisma.message.findMany({
    where: { leadId },
    orderBy: { created_at: "asc" },
  });

  return { leadId, messages };
}

/**
 * Main: startBaileysInstance — adaptado para usar os helpers acima.
 */

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
        instances.set(instance_id, { ...instance, status });
        await startBaileysInstance({ instance_id });
        break;
      }
    }

    io.emit(`status:${instance_id}`, status);

    io.on('connection',async(socket)=>{
      socket.emit(`qr:${instance_id}`, qr);
      socket.emit(`status:${instance_id}`, status);
    })

    instances.set(instance_id, { ...instance, status, socket: sock });

    await prisma.whatsAppInstance.update({
      where: { instance_id },
      data: { status },
    });
  });

  // Recebe mensagens do WhatsApp
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message || msg?.key.fromMe) return;

    const phone = msg.key.remoteJid!;
    const text = (
      msg.message.conversation ||
      msg.message?.extendedTextMessage?.text ||
      ""
    ).toString();
    const name = msg.pushName || "";

    // garante o objeto em memória (busca db se necessário)
    const currentCustomer = await getOrCreateCustomer(phone, name);

    // registra em memória e possivelmente no DB
    await logMessage(phone, "customer", text);

    // fluxo de estados
    switch (currentCustomer.state) {
      case "idle": {
        // procura menu por keyword
        const menu = MENU.find((m) =>
          m.keywords.some((k) => text.toLowerCase().includes(k))
        );
        if (!menu) {
          const reply = "Nenhum gatilho encontrado";
          await sock.sendMessage(phone, { text: reply });
          await logMessage(phone, "menu", reply);
          return;
        }

        await sock.sendMessage(phone, { text: menu.message });
        await logMessage(phone, "menu", menu.message);

        currentCustomer.state = "await_option";
        customers.set(phone, currentCustomer);
        break;
      }

      case "await_option": {
        const parseText = Number(text.trim());
        if (!parseText) {
          const reply = "Por favor, escolha algumas das opções";
          await sock.sendMessage(phone, { text: reply });
          await logMessage(phone, "menu", reply);
          return;
        }

        const option = MENU[0]?.options.find((o) => o.trigger === parseText);
        if (!option) {
          const reply = "Por favor, escolha algumas das opções";
          await sock.sendMessage(phone, { text: reply });
          await logMessage(phone, "menu", reply);
          return;
        }

        if (option.action === "AUTO_REPLY") {
          await sock.sendMessage(phone, { text: option.reply_text! });
          await logMessage(phone, "menu", option.reply_text!);
          currentCustomer.state = "idle";
          customers.set(phone, currentCustomer);
          return;
        }

        if (option.action === "REDIRECT_QUEUE") {
          const reply =
            "🙋 Você foi adicionado à fila de atendimento. Aguarde um atendente.";
          await sock.sendMessage(phone, { text: reply });
          await logMessage(phone, "menu", reply);

          // Persistir lead + mensagens no DB e emitir evento 'new_customer'
          const result = await persistMessagesAndCreateLead(phone);

          // atualiza estado na memória e no DB
          currentCustomer.state = "in_queue";
          currentCustomer.leadId = result?.leadId;
          customers.set(phone, currentCustomer);

          await prisma.lead.update({
            where: { id: currentCustomer.leadId },
            data: { state: "in_queue" },
          });

          io.emit("new_customer", {
            phone: currentCustomer.phone,
            name: currentCustomer.name,
            messages: result?.messages ?? [],
            leadId: currentCustomer.leadId,
          });
          return;
        }
        break;
      }

      case "in_queue": {
        const reply = "🙋 Você está na fila, aguardando um atendente.";
        await sock.sendMessage(phone, { text: reply });
        await logMessage(phone, "menu", reply);
        break;
      }

      case "in_service": {
        // já logamos; só emitir para atendente conectado
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

  // sockets para o painel
  io.on("connection", (socket) => {
    socket.on("start_service", async ({ phone }) => {
      const currentCustomer = customers.get(phone);
      if (!currentCustomer) return;

      // atualiza estado DB e memória
      if (currentCustomer.leadId) {
        await prisma.lead.update({
          where: { id: currentCustomer.leadId },
          data: { state: "in_service" },
        });
      } else {
        // se nao tem leadId — criar (rare)
        const lead = await prisma.lead.upsert({
          where: { phone },
          create: { phone, name: currentCustomer.name, state: "in_service" },
          update: { state: "in_service" },
        });
        currentCustomer.leadId = lead.id;
      }

      currentCustomer.state = "in_service";
      customers.set(phone, currentCustomer);

      socket.join(`chat_${phone}`);

      // buscar histórico do DB (se houver) + mensagens em memória (se houver)
      const dbMessages = await prisma.message.findMany({
        where: { leadId: currentCustomer.leadId },
        orderBy: { created_at: "asc" },
      });

      // combinar (DB já contém as mensagens persistidas)
      const combined = dbMessages.map((m) => ({
        from: m.from,
        text: m.text,
        createdAt: m.created_at,
      }));

      socket.emit("open_chat", {
        phone: currentCustomer.phone,
        name: currentCustomer.name,
        messages: combined,
        leadId: currentCustomer.leadId,
      });
    });

    socket.on("send_message", async ({ phone, text }) => {
      const currentCustomer = customers.get(phone);
      if (!currentCustomer) return;

      // loga e persiste (se estiver in_service/in_queue)
      await logMessage(phone, "agent", text);

      // envia pro cliente via WhatsApp
      try {
        await sock.sendMessage(phone, { text });
      } catch (err) {
        console.error("Erro ao enviar WA:", err);
      }

      // emitir para sala
      io.to(`chat_${phone}`).emit("new_message", {
        from: "agent",
        text,
        phone,
        state: currentCustomer.state,
      });
    });

    socket.on("finish_service", async ({ phone }) => {
      const currentCustomer = customers.get(phone);
      if (!currentCustomer) return;

      // Marca lead como idle (ou finished, conforme sua regra)
      if (currentCustomer.leadId) {
        await prisma.lead.update({
          where: { id: currentCustomer.leadId },
          data: { state: "idle" },
        });
      }
      // atualiza memória e remove do cache (ou marca finished, sua escolha)
      currentCustomer.state = "idle";
      customers.set(phone, currentCustomer);

      socket.to(`chat_${phone}`).emit("chat_finished", { phone });
    });

    // rota para painel pedir lista de leads — se precisar, pode criar rota HTTP
  });

  sock.ev.on("creds.update", saveCreds);
  return sock;
};

/**
 * Carrega instâncias no startup (mantive seu código)
 */
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
