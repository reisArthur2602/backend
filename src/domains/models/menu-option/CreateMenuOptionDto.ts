import type { OptionAction } from '@prisma/client';

export interface CreateMenuOptionDto {
  menu_id: string;
  trigger: number;
  payload: any;
  label: string;
  action: OptionAction;
}
