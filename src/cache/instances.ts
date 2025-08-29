// src/instances.ts
import { type WASocket } from "@whiskeysockets/baileys";

export type WhatsAppInstance = {
  instance_id: string;
  status: "pending" | "active" | "disconnected";
  socket?: WASocket;
};

export const instances: Map<string, WhatsAppInstance> = new Map();
