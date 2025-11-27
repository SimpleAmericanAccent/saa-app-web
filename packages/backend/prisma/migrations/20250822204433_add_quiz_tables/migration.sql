-- CreateEnum
CREATE TYPE "Side" AS ENUM ('A', 'B');

-- CreateTable
CREATE TABLE "pair" (
    "pair_id" TEXT NOT NULL,
    "contrast_key" TEXT NOT NULL,
    "word_a" TEXT NOT NULL,
    "word_b" TEXT NOT NULL,
    "audio_a_url" TEXT NOT NULL,
    "audio_b_url" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pair_pkey" PRIMARY KEY ("pair_id")
);

-- CreateTable
CREATE TABLE "trial" (
    "trial_id" TEXT NOT NULL,
    "user_id" INTEGER,
    "pair_id" TEXT NOT NULL,
    "presented_side" "Side" NOT NULL,
    "choice_side" "Side" NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "presented_at" TIMESTAMP(3) NOT NULL,
    "responded_at" TIMESTAMP(3) NOT NULL,
    "latency_ms" INTEGER NOT NULL,

    CONSTRAINT "trial_pkey" PRIMARY KEY ("trial_id")
);

-- CreateIndex
CREATE INDEX "ix_user_time" ON "trial"("user_id", "presented_at" DESC);

-- CreateIndex
CREATE INDEX "ix_user_pair_time" ON "trial"("user_id", "pair_id", "presented_at" DESC);

-- AddForeignKey
ALTER TABLE "trial" ADD CONSTRAINT "trial_pair_id_fkey" FOREIGN KEY ("pair_id") REFERENCES "pair"("pair_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trial" ADD CONSTRAINT "trial_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
