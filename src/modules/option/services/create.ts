import type { MenuOptionAction } from "@prisma/client";

import { prisma } from "../../../lib/prisma.js";

interface ICreateOptionsService {
  options: {
    menu_id: string;
    trigger: number;
    reply_text: string | null;
    label: string;
    action: MenuOptionAction;
  }[];
}
export const createOptionsService = async ({
  options,
}: ICreateOptionsService) => {
  const triggers = options.map((opt) => `${opt.menu_id}-${opt.trigger}`);
  const hasDuplicates = new Set(triggers).size !== triggers.length;

  if (hasDuplicates) {
    throw new Error(
      "Existem teclas (trigger) duplicadas dentro do mesmo menu."
    );
  }

  const createdOptions = await prisma.menuOption.createMany({
    data: options,
    skipDuplicates: true,
  });
  return createdOptions;
};
