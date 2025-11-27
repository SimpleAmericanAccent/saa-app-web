/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `auth0Id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - The primary key for the `_UserAudios` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[auth0_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - The required column `user_id` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Made the column `user_id` on table `trial` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_UserAudios" DROP CONSTRAINT "_UserAudios_B_fkey";

-- DropForeignKey
ALTER TABLE "trial" DROP CONSTRAINT "trial_user_id_fkey";

-- DropIndex
DROP INDEX "User_auth0Id_key";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "auth0Id",
DROP COLUMN "createdAt",
DROP COLUMN "id",
ADD COLUMN     "auth0_id" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("user_id");

-- AlterTable
ALTER TABLE "_UserAudios" DROP CONSTRAINT "_UserAudios_AB_pkey",
ALTER COLUMN "B" SET DATA TYPE TEXT,
ADD CONSTRAINT "_UserAudios_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "trial" ALTER COLUMN "user_id" SET NOT NULL,
ALTER COLUMN "user_id" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_auth0_id_key" ON "User"("auth0_id");

-- AddForeignKey
ALTER TABLE "trial" ADD CONSTRAINT "trial_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserAudios" ADD CONSTRAINT "_UserAudios_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
