import type { Lead, Prisma } from '@prisma/client';
import type BaileysAdapter from '../../infraestructure/baileys/BaileysAdapter.js';
import RedisCache, { type IRedisCache } from '../../shared/cache/RedisCache.js';
import GetMenusService from '../menu/GetMenuService.js';
import CreateLeadService from './CreateLeadService.js';

import UpdateLeadService from './UpdateLeadService.js';
import type { ILeadRepository } from '../../domains/repositories/ILeadRepository.js';
import LeadRepository from '../../repositories/LeadRepository.js';
import type { IMatchRepository } from '../../domains/repositories/IMatchRepository.js';
import MatchRepository from '../../repositories/MatchRepository.js';

interface ICurrentLead {
  phone: string;
  selectedMenu: Prisma.MenuGetPayload<{ include: { options: true } }> | null;
  state: 'idle' | 'await_option';
}
interface IReceivedMessage {
  phone: string;
  text: string;
  senderName: string;
}

export default class ProcessLeadMessageService {
  private redisCache: IRedisCache;
  private leadRepository: ILeadRepository;
  private matchRepository: IMatchRepository;

  constructor(private baileys: BaileysAdapter) {
    this.redisCache = new RedisCache();
    this.leadRepository = new LeadRepository();
    this.matchRepository = new MatchRepository();
  }

  private async ensureLead(data: { senderName: string; phone: string; text: string }) {
    let currentLead: ICurrentLead | null;

    currentLead = await this.redisCache.recover<ICurrentLead>({
      key: `lead:${data.phone}`,
    });

    if (currentLead) return currentLead;

    const createdLead = await new CreateLeadService().execute({
      name: data.senderName,
      phone: data.phone,
    });

    currentLead = { phone: createdLead.phone, selectedMenu: null, state: 'idle' };

    await this.redisCache.save({ key: `lead:${data.phone}`, value: currentLead });
    return currentLead;
  }

  private async processLeadState({
    currentLead,
    message,
  }: {
    currentLead: ICurrentLead;
    message: IReceivedMessage;
  }) {
    switch (currentLead.state) {
      case 'idle': {
        const menus = await new GetMenusService().execute();

        const menuFound = menus.find((menu) =>
          menu.keywords.some((keyword) => message.text.includes(keyword)),
        );

        if (!menuFound) break;

        await this.baileys.sendTextMessage({ phone: message.phone, text: menuFound.message });

        await this.matchRepository.create({
          lead_phone: currentLead.phone,
          menu_id: menuFound.id,
          message: message.text,
        });

        if (menuFound.options.length === 0) break;

        currentLead.state = 'await_option';
        currentLead.selectedMenu = menuFound;

        await this.redisCache.save({ key: `lead:${message.phone}`, value: currentLead });

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

        const selectedMenu = currentLead.selectedMenu;
        if (!selectedMenu) break;

        const optionFound = selectedMenu.options.find((option) => option.trigger === parsed);

        if (!optionFound) {
          await this.baileys.sendTextMessage({
            phone: message.phone,
            text: 'Opção inválida. Por favor, escolha uma das opções listadas no menu.',
          });
          break;
        }

        const action = optionFound.action;
        const payload = optionFound.payload ?? {};

        if (action === 'auto_reply') {
          const reply = payload as { reply_text: string };

          await this.baileys.sendTextMessage({
            phone: message.phone,
            text: reply.reply_text,
          });
          currentLead.state = 'idle';
          currentLead.selectedMenu = null;
          await this.redisCache.save({ key: `lead:${message.phone}`, value: currentLead });
        }

        break;
      }
    }
  }

  public async execute(message: IReceivedMessage) {
    const currentLead = await this.ensureLead(message);
    await this.processLeadState({ currentLead, message });
  }
}
