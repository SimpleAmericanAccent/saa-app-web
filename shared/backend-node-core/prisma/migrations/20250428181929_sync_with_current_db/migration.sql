/*
  Warnings:

  - You are about to drop the column `mp3url` on the `Audio` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Audio` table. All the data in the column will be lost.
  - You are about to drop the column `speakerId` on the `Audio` table. All the data in the column will be lost.
  - You are about to drop the column `tranurl` on the `Audio` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Word` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `Word` table. All the data in the column will be lost.
  - You are about to drop the column `wordIndex` on the `Word` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[word]` on the table `Word` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `duration` to the `Audio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Audio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Audio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Issue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Word` table without a default value. This is not possible if the table is not empty.
  - Added the required column `word` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Word" DROP CONSTRAINT "Word_audioId_fkey";

-- AlterTable
ALTER TABLE "Audio" DROP COLUMN "mp3url",
DROP COLUMN "name",
DROP COLUMN "speakerId",
DROP COLUMN "tranurl",
ADD COLUMN     "duration" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Word" DROP COLUMN "name",
DROP COLUMN "timestamp",
DROP COLUMN "wordIndex",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "word" TEXT NOT NULL,
ALTER COLUMN "audioId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "DictionaryEntry" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "DictionaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordUsage" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "partOfSpeech" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,

    CONSTRAINT "WordUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pronunciation" (
    "id" SERIAL NOT NULL,
    "usageId" INTEGER NOT NULL,
    "phonemic" TEXT,
    "broadIPA" TEXT,
    "narrowIPA" TEXT,
    "audioUrl" TEXT,
    "speaker" TEXT,
    "dialect" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "order" INTEGER DEFAULT 0,

    CONSTRAINT "Pronunciation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordVariation" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "form" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRegular" BOOLEAN NOT NULL,
    "notes" TEXT,

    CONSTRAINT "WordVariation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpellingPattern" (
    "id" SERIAL NOT NULL,
    "usageId" INTEGER NOT NULL,
    "pattern" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER,

    CONSTRAINT "SpellingPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LexicalSet" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LexicalSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LexicalSetUsage" (
    "id" SERIAL NOT NULL,
    "lexicalSetId" INTEGER NOT NULL,
    "usageId" INTEGER NOT NULL,
    "order" INTEGER,

    CONSTRAINT "LexicalSetUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Example" (
    "id" SERIAL NOT NULL,
    "usageId" INTEGER NOT NULL,
    "sentence" TEXT NOT NULL,
    "context" TEXT,
    "difficulty" TEXT,
    "tags" TEXT[],

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsonantPhoneme" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsonantPhoneme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsonantPhonemeUsage" (
    "id" SERIAL NOT NULL,
    "consonantPhonemeId" INTEGER NOT NULL,
    "usageId" INTEGER NOT NULL,
    "order" INTEGER,

    CONSTRAINT "ConsonantPhonemeUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_WordPronunciation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_WordPronunciation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_WordConsonants" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_WordConsonants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "DictionaryEntry_word_key" ON "DictionaryEntry"("word");

-- CreateIndex
CREATE UNIQUE INDEX "LexicalSet_name_key" ON "LexicalSet"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LexicalSetUsage_lexicalSetId_usageId_key" ON "LexicalSetUsage"("lexicalSetId", "usageId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsonantPhoneme_name_key" ON "ConsonantPhoneme"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ConsonantPhonemeUsage_consonantPhonemeId_usageId_key" ON "ConsonantPhonemeUsage"("consonantPhonemeId", "usageId");

-- CreateIndex
CREATE INDEX "_WordPronunciation_B_index" ON "_WordPronunciation"("B");

-- CreateIndex
CREATE INDEX "_WordConsonants_B_index" ON "_WordConsonants"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Word_word_key" ON "Word"("word");

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "Audio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordUsage" ADD CONSTRAINT "WordUsage_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DictionaryEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pronunciation" ADD CONSTRAINT "Pronunciation_usageId_fkey" FOREIGN KEY ("usageId") REFERENCES "WordUsage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordVariation" ADD CONSTRAINT "WordVariation_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DictionaryEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpellingPattern" ADD CONSTRAINT "SpellingPattern_usageId_fkey" FOREIGN KEY ("usageId") REFERENCES "WordUsage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LexicalSetUsage" ADD CONSTRAINT "LexicalSetUsage_lexicalSetId_fkey" FOREIGN KEY ("lexicalSetId") REFERENCES "LexicalSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LexicalSetUsage" ADD CONSTRAINT "LexicalSetUsage_usageId_fkey" FOREIGN KEY ("usageId") REFERENCES "WordUsage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Example" ADD CONSTRAINT "Example_usageId_fkey" FOREIGN KEY ("usageId") REFERENCES "WordUsage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsonantPhonemeUsage" ADD CONSTRAINT "ConsonantPhonemeUsage_consonantPhonemeId_fkey" FOREIGN KEY ("consonantPhonemeId") REFERENCES "ConsonantPhoneme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsonantPhonemeUsage" ADD CONSTRAINT "ConsonantPhonemeUsage_usageId_fkey" FOREIGN KEY ("usageId") REFERENCES "WordUsage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WordPronunciation" ADD CONSTRAINT "_WordPronunciation_A_fkey" FOREIGN KEY ("A") REFERENCES "LexicalSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WordPronunciation" ADD CONSTRAINT "_WordPronunciation_B_fkey" FOREIGN KEY ("B") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WordConsonants" ADD CONSTRAINT "_WordConsonants_A_fkey" FOREIGN KEY ("A") REFERENCES "ConsonantPhoneme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WordConsonants" ADD CONSTRAINT "_WordConsonants_B_fkey" FOREIGN KEY ("B") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;
