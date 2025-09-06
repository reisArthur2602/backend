import type { OptionAction } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

class MenuOptionRepository {
  public async create(input: {
    menu_id: string;
    trigger: number;
    payload: any;
    label: string;
    action: OptionAction;
  }) {
    const options = await prisma.menuOption.create({
      data: input,
    });

    return options;
  }

  public async get() {
    const options = await prisma.menuOption.findMany();
    return options;
  }

  public async delete(input: { id: string }) {
    const options = await prisma.menuOption.delete({ where: { id: input.id } });
    return options;
  }
}

export default MenuOptionRepository;
