import type { OptionAction } from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";

interface ICreateOptionsService {
  menu_id: string;
  trigger: number;
  payload: any;
  label: string;
  action: OptionAction;
}
export const createOptionsService = async ({
  action,
  label,
  menu_id,
  payload,
  trigger,
}: ICreateOptionsService) => {
  const options = await prisma.menuOption.create({
    data: { action, label, menu_id, payload: payload, trigger },
  });
  return options;
};
