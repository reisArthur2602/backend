import BaileysAdapter from '../../infraestructure/baileys/BaileysAdapter.js';
import ProcessLeadMessageService from '../../services/lead/ProcessLeadMessageService.js';
import { normalizeText } from '../../utils/normalize-text.js';

export const bootstrap = async () => {
  const baileysAdapter = new BaileysAdapter('marketing');
  const processLeadMessageService = new ProcessLeadMessageService(baileysAdapter);

  baileysAdapter.on('connection', ({ status, qr }) => {
    console.log('Status da conexão:', status);
  });

  baileysAdapter.on('received.message', async ({ senderName, phone, text }) => {
    await processLeadMessageService.execute({ phone, text: normalizeText(text), senderName });
  });

  await baileysAdapter.init();
};
