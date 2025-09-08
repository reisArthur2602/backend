import BaileysAdapter from '../../infra/baileys/BaileysAdapter.js';
import ProcessLeadMessageService from '../../modules/Lead/services/ProcessLeadMessageService.js';
import { normalizeText } from '../../utils/normalize-text.js';
import { io } from './server.js';

export const bootstrap = async () => {
  let currentStatus: 'pending' | 'connected' | 'connecting' = 'pending';
  let currentQr: undefined | string;

  const baileysAdapter = new BaileysAdapter('marketing');

  const processLeadMessageService = new ProcessLeadMessageService(
    baileysAdapter,
  );

  baileysAdapter.on('connection', async ({ status, qr }) => {
    currentStatus = status;
    currentQr = qr;

    io.emit('connection.status', { status: currentStatus, qr: currentQr });
  });

  baileysAdapter.on('received.message', async ({ senderName, phone, text }) => {
    await processLeadMessageService.execute({
      phone,
      text: normalizeText(text),
      senderName,
    });
  });

  io.on('connection', async (socket) => {
    socket.emit('connection.status', { status: currentStatus, qr: currentQr });
  });

  await baileysAdapter.init();
};
