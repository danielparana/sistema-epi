-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "sectorId" INTEGER;

-- CreateTable
CREATE TABLE "Sector" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Responsible" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sectorId" INTEGER NOT NULL,

    CONSTRAINT "Responsible_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sector_nome_key" ON "Sector"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Responsible_email_key" ON "Responsible"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Responsible_sectorId_key" ON "Responsible"("sectorId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Responsible" ADD CONSTRAINT "Responsible_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
