/*
  Warnings:

  - You are about to drop the column `contrast_key` on the `pair` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contrast_id,word_a,word_b]` on the table `pair` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contrast_id` to the `pair` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pair" DROP COLUMN "contrast_key",
ADD COLUMN     "contrast_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "contrast" (
    "contrast_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "sound1_name" TEXT NOT NULL,
    "sound2_name" TEXT NOT NULL,
    "sound1_symbol" TEXT,
    "sound2_symbol" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "contrast_pkey" PRIMARY KEY ("contrast_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contrast_key_key" ON "contrast"("key");

-- CreateIndex
CREATE UNIQUE INDEX "pair_contrast_id_word_a_word_b_key" ON "pair"("contrast_id", "word_a", "word_b");

-- AddForeignKey
ALTER TABLE "pair" ADD CONSTRAINT "pair_contrast_id_fkey" FOREIGN KEY ("contrast_id") REFERENCES "contrast"("contrast_id") ON DELETE RESTRICT ON UPDATE CASCADE;
