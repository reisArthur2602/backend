-- DropForeignKey
ALTER TABLE "public"."matchs" DROP CONSTRAINT "matchs_lead_phone_fkey";

-- DropForeignKey
ALTER TABLE "public"."matchs" DROP CONSTRAINT "matchs_menu_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."matchs" ADD CONSTRAINT "matchs_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matchs" ADD CONSTRAINT "matchs_lead_phone_fkey" FOREIGN KEY ("lead_phone") REFERENCES "public"."leads"("phone") ON DELETE CASCADE ON UPDATE CASCADE;
