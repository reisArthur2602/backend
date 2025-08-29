-- CreateEnum
CREATE TYPE "public"."WhatsAppInstanceStatus" AS ENUM ('pending', 'active', 'disconnected');

-- CreateTable
CREATE TABLE "public"."whatsapp_instances" (
    "id" TEXT NOT NULL,
    "instance_id" TEXT NOT NULL,
    "status" "public"."WhatsAppInstanceStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_instances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_instances_instance_id_key" ON "public"."whatsapp_instances"("instance_id");
