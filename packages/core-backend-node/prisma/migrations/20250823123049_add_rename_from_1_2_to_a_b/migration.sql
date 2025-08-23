/*
  Warnings:

  - You are about to drop the column `sound1_name` on the `contrast` table. All the data in the column will be lost.
  - You are about to drop the column `sound1_symbol` on the `contrast` table. All the data in the column will be lost.
  - You are about to drop the column `sound2_name` on the `contrast` table. All the data in the column will be lost.
  - You are about to drop the column `sound2_symbol` on the `contrast` table. All the data in the column will be lost.
  - Added the required column `sound_a_name` to the `contrast` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sound_b_name` to the `contrast` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contrast" DROP COLUMN "sound1_name",
DROP COLUMN "sound1_symbol",
DROP COLUMN "sound2_name",
DROP COLUMN "sound2_symbol",
ADD COLUMN     "sound_a_name" TEXT NOT NULL,
ADD COLUMN     "sound_a_symbol" TEXT,
ADD COLUMN     "sound_b_name" TEXT NOT NULL,
ADD COLUMN     "sound_b_symbol" TEXT;
