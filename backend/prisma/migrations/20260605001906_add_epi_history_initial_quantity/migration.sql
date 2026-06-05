-- AlterTable
ALTER TABLE "Epi" ADD COLUMN     "initialQuantidade" INTEGER;

-- CreateTable
CREATE TABLE "EpiHistory" (
    "id" SERIAL NOT NULL,
    "epiId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "previousNome" TEXT,
    "previousLote" TEXT NOT NULL,
    "previousDescricao" TEXT,
    "previousQuantidade" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EpiHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EpiHistory" ADD CONSTRAINT "EpiHistory_epiId_fkey" FOREIGN KEY ("epiId") REFERENCES "Epi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpiHistory" ADD CONSTRAINT "EpiHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
