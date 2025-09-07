import fs from 'fs';
import path from 'path';
import qrCodeTerminal from 'qrcode-terminal';
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  type WASocket,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import EventEmitter from 'events';

class BaileysAdapter extends EventEmitter {
  private sock!: WASocket;
  private instanceId: string;
  private instancePath: string;
  private status: 'pending' | 'connected' | 'connecting';
  constructor(instanceId: string) {
    super();
    this.instanceId = instanceId;
    this.instancePath = this.ensureInstancePath();
    this.status = 'pending';
  }

  private ensureInstancePath(): string {
    const instancePath = path.join('./instances', this.instanceId);

    if (!fs.existsSync(instancePath)) fs.mkdirSync(instancePath, { recursive: true });

    return instancePath;
  }

  public async init() {
    const { state, saveCreds } = await useMultiFileAuthState(this.instancePath);
    this.sock = makeWASocket({ auth: state });

    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrCodeTerminal.generate(qr, { small: true });
        this.status = 'pending';
      }

      switch (connection) {
        case 'connecting': {
          this.status = 'connecting';
          break;
        }

        case 'open': {
          this.status = 'connected';
          break;
        }
        case 'close': {
          const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;

          if (reason === DisconnectReason.loggedOut)
            fs.rmSync(this.instancePath, { recursive: true, force: true });

          await this.init();
          break;
        }
      }

      this.emit('connection', {
        status: this.status,
        qr,
      });
    });

    this.sock.ev.on('messages.upsert', async ({ messages }) => {
      const msg = messages[0];
      if (!msg?.message || msg?.key?.fromMe) return;

      const senderName = msg.pushName || '';
      const phone = msg.key.remoteJid!;
      const text = msg.message.conversation || msg.message?.extendedTextMessage?.text || '';

      this.emit('received.message', {
        senderName,
        phone,
        text,
      });
    });

    this.sock.ev.on('creds.update', saveCreds);
  }

  public async sendTextMessage({ phone, text }: { phone: string; text: string }) {
    await this.sock.sendMessage(phone, { text });
  }
}

export default BaileysAdapter;
