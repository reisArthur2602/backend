import type { Prisma } from '@prisma/client';
import type { IRedisCache } from '../../../infra/database/redis/Redis.js';
import type { ILeadRepository } from '../domain/repository/ILeadRepository.js';
import type { IMatchRepository } from '../../Match/domain/repository/IMatchRepository.js';
import type BaileysAdapter from '../../../infra/baileys/BaileysAdapter.js';

import RedisCache from '../../../infra/database/redis/Redis.js';
import LeadRepository from '../repository/LeadRepository.js';
import MatchRepository from '../../Match/repository/MatchRepository.js';

import GetMenusService from '../../Menu/services/GetMenuService.js';
import CreateLeadService from './CreateLeadService.js';

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

  private async ensureLead(data: {
    senderName: string;
    phone: string;
    text: string;
  }) {
    let currentLead: ICurrentLead | null;

    currentLead = await this.redisCache.recover<ICurrentLead>({
      key: `lead:${data.phone}`,
    });

    if (currentLead) return currentLead;

    const createdLead = await new CreateLeadService().execute({
      name: data.senderName,
      phone: data.phone,
    });

    currentLead = {
      phone: createdLead.phone,
      selectedMenu: null,
      state: 'idle',
    };

    await this.redisCache.save({
      key: `lead:${data.phone}`,
      value: currentLead,
    });
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

        await this.baileys.sendTextMessage({
          phone: message.phone,
          text: menuFound.message,
        });

        await this.matchRepository.create({
          lead_phone: currentLead.phone,
          menu_id: menuFound.id,
          message: message.text,
        });

        if (menuFound.options.length === 0) break;

        await this.redisCache.save({
          key: `lead:${message.phone}`,
          value: {
            ...currentLead,
            state: 'await_option',
            selectedMenu: menuFound,
          },
        });

        break;
      }

      case 'await_option': {
        const parsed = Number(message.text);

        if (!parsed) {
          await this.redisCache.save({
            key: `lead:${message.phone}`,
            value: { ...currentLead, state: 'idle', selectedMenu: null },
          });
          break;
        }

        const optionFound = currentLead.selectedMenu?.options.find(
          (option) => option.trigger === parsed,
        );

        if (optionFound) {
          const action = optionFound?.action;
          const payload = optionFound?.payload ?? {};

          if (action === 'auto_reply') {
            const reply = payload as { reply_text: string };

            await this.baileys.sendTextMessage({
              phone: message.phone,
              text: reply.reply_text,
            });
          }
        }

        await this.redisCache.save({
          key: `lead:${message.phone}`,
          value: { ...currentLead, state: 'idle', selectedMenu: null },
        });
      }
    }
  }

  public async execute(message: IReceivedMessage) {
    const currentLead = await this.ensureLead(message);
    await this.processLeadState({ currentLead, message });
  }
}
