/*
  Warnings:

  - A unique constraint covering the columns `[trigger]` on the table `menu_options` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "menu_options_trigger_key" ON "public"."menu_options"("trigger");
