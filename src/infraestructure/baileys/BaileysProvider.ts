import fs from "fs";
import path from "path";
import qrcode from "qrcode-terminal";

import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  type WASocket,
} from "@whiskeysockets/baileys";

import { Boom } from "@hapi/boom";

const INSTANCES_PATH = "./instances";

class BaileysProvider {
  private sock!: WASocket;
  private instanceId: string;

  constructor(instanceId: string) {
    this.instanceId = instanceId;
  }

  public async init(io: any) {
    const instancePath = path.join(INSTANCES_PATH, this.instanceId);
    fs.mkdirSync(instancePath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(instancePath);
    this.sock = makeWASocket({ auth: state });

    this.sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrcode.generate(qr, { small: true });
        io.emit(`qr:${this.instanceId}`, qr);
      }

      if (connection === "close") {
        const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;
        if (reason === DisconnectReason.loggedOut) {
          fs.rmSync(instancePath, { recursive: true, force: true });
        }
        await this.init(io);
      }

      if (connection === "open") {
        io.emit(`status:${this.instanceId}`, "active");
      }
    });

    this.sock.ev.on("creds.update", saveCreds);
  }

  public async sendTextMessage(to: string, text: string) {
    await this.sock.sendMessage(to, { text });
  }

  public onMessage(
    callback: (input: { from: string; message: string }) => void
  ) {
    this.sock.ev.on("messages.upsert", ({ messages }) => {
      const m = messages[0];
      if (!m?.message || m.key.fromMe) return;

      const text =
        m.message.conversation || m.message?.extendedTextMessage?.text || "";
        
      callback({ from: m.key.remoteJid!, message: text });
    });
  }
}

export default BaileysProvider;
