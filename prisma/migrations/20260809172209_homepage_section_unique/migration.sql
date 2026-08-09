/*
  Warnings:

  - A unique constraint covering the columns `[sectionType]` on the table `HomepageSection` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "HomepageSection_sectionType_key" ON "HomepageSection"("sectionType");
