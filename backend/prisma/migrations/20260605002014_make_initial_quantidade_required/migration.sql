/*
  Warnings:

  - Made the column `initialQuantidade` on table `Epi` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Epi" ALTER COLUMN "initialQuantidade" SET NOT NULL;
