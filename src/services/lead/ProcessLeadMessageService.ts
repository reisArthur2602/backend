import type { Lead, Prisma } from '@prisma/client';
import type BaileysAdapter from '../../infraestructure/baileys/BaileysAdapter.js';
import RedisCache, { type IRedisCache } from '../../shared/cache/RedisCache.js';
import GetMenusService from '../menu/GetMenuService.js';
import CreateLeadService from './CreateLeadService.js';
import GetLeadByPhoneService from './GetLeadByPhoneService.js';
import UpdateLeadService from './UpdateLeadService.js';

interface IReceivedMessage {
  phone: string;
  text: string;
  senderName: string;
}

export default class ProcessLeadMessageService {
  private redisCache: IRedisCache;

  constructor(private baileys: BaileysAdapter) {
    this.redisCache = new RedisCache();
  }

  private async ensureLead(data: { senderName: string; phone: string; text: string }) {
    const getLeadByPhoneService = new GetLeadByPhoneService();
    const createLeadService = new CreateLeadService();

    let currentLead = await getLeadByPhoneService.execute({ phone: data.phone });
    if (currentLead) return currentLead;

    currentLead = await createLeadService.execute({ name: data.senderName, phone: data.phone });
    await this.redisCache.save({ key: `lead:${data.phone}`, value: currentLead });
    return currentLead;
  }

  private async processLeadState({
    currentLead,
    message,
  }: {
    currentLead: Lead;
    message: IReceivedMessage;
  }) {
    const updateLeadService = new UpdateLeadService();

    switch (currentLead.state) {
      case 'idle': {
        const menus = await new GetMenusService().execute();

        const menuFound = menus.find((menu) =>
          menu.keywords.some((keyword) => message.text.includes(keyword)),
        );

        if (!menuFound) break;

        await this.baileys.sendTextMessage({ phone: message.phone, text: menuFound.message });

        if (menuFound.options.length === 0) break;

        currentLead.state = 'await_option';

        await this.redisCache.save({ key: `lead:${message.phone}`, value: currentLead });

        await this.redisCache.save({
          key: `selectedMenuLead:${message.phone}`,
          value: menuFound,
        });

        await updateLeadService.execute({ phone: currentLead.phone, state: 'await_option' });

        break;
      }

      case 'await_option': {
        const parsed = Number(message.text);

        if (!parsed) {
          await this.baileys.sendTextMessage({
            phone: message.phone,
            text: 'Por favor, escolha uma das opções (digite o número).',
          });
          break;
        }

        const selectedMenuLead = await this.redisCache.recover<
          Prisma.MenuGetPayload<{ include: { options: true } }>
        >({
          key: `selectedMenuLead:${message.phone}`,
        });

        if (!selectedMenuLead) break;

        const optionFound = selectedMenuLead.options.find((option) => option.trigger === parsed);

        if (!optionFound) {
          await this.baileys.sendTextMessage({
            phone: message.phone,
            text: 'Opção inválida. Por favor, escolha uma das opções listadas no menu.',
          });
          break;
        }

        const action = optionFound.action;
        const payload = optionFound.payload ?? {};

        switch (action) {
          case 'auto_reply': {
            const reply = payload as { reply_text: string };

            await this.baileys.sendTextMessage({
              phone: message.phone,
              text: reply.reply_text,
            });

            currentLead.state = 'idle';
            await this.redisCache.save({ key: `lead:${message.phone}`, value: currentLead });
            await this.redisCache.invalidate({
              key: `selectedMenuLead:${message.phone}`,
            });
            await updateLeadService.execute({ phone: currentLead.phone, state: 'idle' });
            break;
          }
        }
      }
    }
  }

  public async execute(message: IReceivedMessage) {
    const currentLead = await this.ensureLead(message);
    await this.processLeadState({ currentLead, message });
  }
}
