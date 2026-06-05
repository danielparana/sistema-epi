/*
  Warnings:

  - You are about to drop the column `validade` on the `Epi` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lote]` on the table `Epi` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Epi" DROP COLUMN "validade",
ADD COLUMN     "descricao" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Epi_lote_key" ON "Epi"("lote");
