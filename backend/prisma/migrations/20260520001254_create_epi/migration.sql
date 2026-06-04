-- CreateTable
CREATE TABLE "public"."Epi" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "lote" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "validade" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Epi_pkey" PRIMARY KEY ("id")
);
