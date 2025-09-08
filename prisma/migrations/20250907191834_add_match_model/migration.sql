-- CreateTable
CREATE TABLE "public"."matchs" (
    "id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "lead_phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matchs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."matchs" ADD CONSTRAINT "matchs_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matchs" ADD CONSTRAINT "matchs_lead_phone_fkey" FOREIGN KEY ("lead_phone") REFERENCES "public"."leads"("phone") ON DELETE RESTRICT ON UPDATE CASCADE;
