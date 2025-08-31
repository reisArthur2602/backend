-- CreateEnum
CREATE TYPE "public"."MenuConfigDays" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- CreateEnum
CREATE TYPE "public"."MenuOptionAction" AS ENUM ('auto_reply', 'redirect_queue', 'end_session');

-- CreateTable
CREATE TABLE "public"."menus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "keywords" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "default_message_out_of_time" TEXT,
    "default_message_out_of_date" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."menu_configs" (
    "id" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "days" "public"."MenuConfigDays"[],
    "default_message_out_of_time" BOOLEAN NOT NULL DEFAULT false,
    "default_message_out_of_date" BOOLEAN NOT NULL DEFAULT false,
    "menuId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."menu_options" (
    "id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "trigger" INTEGER NOT NULL,
    "action" "public"."MenuOptionAction" NOT NULL,
    "days" "public"."MenuConfigDays"[],
    "reply_text" TEXT,
    "finish_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "menus_name_key" ON "public"."menus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "menu_configs_menuId_key" ON "public"."menu_configs"("menuId");

-- AddForeignKey
ALTER TABLE "public"."menu_configs" ADD CONSTRAINT "menu_configs_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."menus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."menu_options" ADD CONSTRAINT "menu_options_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
