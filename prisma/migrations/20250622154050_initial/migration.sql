-- CreateTable
CREATE TABLE "results" (
    "id" TEXT NOT NULL,
    "inputText" TEXT NOT NULL,
    "analysisText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);
