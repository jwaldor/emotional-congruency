-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL,
    "resultId" TEXT,
    "email" TEXT,
    "feedback" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);
