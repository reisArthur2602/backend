import type { Menu, Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";
import RedisCache from "../../../shared/cache/RedisCache.js";

export const getMenusService = async () => {
  const redisCache = new RedisCache();

  let menus = await redisCache.recover<Menu[]>({ key: "menus" });
  if (menus) return menus;

  menus = await prisma.menu.findMany();
  await redisCache.save({ key: "menus", value: menus });

  return menus;
};
