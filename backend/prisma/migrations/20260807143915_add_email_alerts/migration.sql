-- CreateTable
CREATE TABLE "EmailAlert" (
    "id" SERIAL NOT NULL,
    "epiId" INTEGER NOT NULL,
    "diasAlerta" INTEGER NOT NULL,
    "enviadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailAlert_epiId_diasAlerta_key" ON "EmailAlert"("epiId", "diasAlerta");

-- AddForeignKey
ALTER TABLE "EmailAlert" ADD CONSTRAINT "EmailAlert_epiId_fkey" FOREIGN KEY ("epiId") REFERENCES "Epi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
