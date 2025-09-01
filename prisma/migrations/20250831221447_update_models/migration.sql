/*
  Warnings:

  - You are about to drop the `chats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."LeadState" AS ENUM ('idle', 'await_option', 'in_queue', 'in_service');

-- CreateEnum
CREATE TYPE "public"."MessageFrom" AS ENUM ('customer', 'menu', 'agent');

-- DropForeignKey
ALTER TABLE "public"."message_logs" DROP CONSTRAINT "message_logs_chat_id_fkey";

-- DropTable
DROP TABLE "public"."chats";

-- DropTable
DROP TABLE "public"."message_logs";

-- DropEnum
DROP TYPE "public"."MESSAGE_FROM";

-- DropEnum
DROP TYPE "public"."StatusChat";

-- CreateTable
CREATE TABLE "public"."Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT NOT NULL,
    "state" "public"."LeadState" NOT NULL DEFAULT 'idle',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "from" "public"."MessageFrom" NOT NULL,
    "leadId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_phone_key" ON "public"."Lead"("phone");

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
