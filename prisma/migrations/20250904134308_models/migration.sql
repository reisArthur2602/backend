-- CreateEnum
CREATE TYPE "public"."OptionAction" AS ENUM ('auto_reply', 'forward_to_number', 'redirect_queue');

-- CreateEnum
CREATE TYPE "public"."LeadState" AS ENUM ('idle', 'await_option', 'in_queue', 'in_service');

-- CreateEnum
CREATE TYPE "public"."MessageFrom" AS ENUM ('customer', 'menu', 'agent');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."menus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."menu_options" (
    "id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "trigger" INTEGER NOT NULL,
    "action" "public"."OptionAction" NOT NULL,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leads" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT NOT NULL,
    "state" "public"."LeadState" NOT NULL DEFAULT 'idle',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "from" "public"."MessageFrom" NOT NULL,
    "leadId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "menus_name_key" ON "public"."menus"("name");

-- CreateIndex
CREATE INDEX "menu_options_menu_id_idx" ON "public"."menu_options"("menu_id");

-- CreateIndex
CREATE UNIQUE INDEX "leads_phone_key" ON "public"."leads"("phone");

-- CreateIndex
CREATE INDEX "messages_leadId_created_at_idx" ON "public"."messages"("leadId", "created_at");

-- AddForeignKey
ALTER TABLE "public"."menu_options" ADD CONSTRAINT "menu_options_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
