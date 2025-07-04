-- AlterTable
ALTER TABLE "results" ADD COLUMN     "analysisType" TEXT NOT NULL DEFAULT 'original',
ADD COLUMN     "analyzedEmotions" TEXT;
