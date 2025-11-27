-- CreateTable
CREATE TABLE "OrthoWord" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "freqSubtlexUs" INTEGER,

    CONSTRAINT "OrthoWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PronCmuDict" (
    "id" SERIAL NOT NULL,
    "orthoWordId" INTEGER NOT NULL,
    "pronCmuDict" TEXT NOT NULL,

    CONSTRAINT "PronCmuDict_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrthoWord_word_key" ON "OrthoWord"("word");

-- CreateIndex
CREATE UNIQUE INDEX "PronCmuDict_orthoWordId_pronCmuDict_key" ON "PronCmuDict"("orthoWordId", "pronCmuDict");

-- AddForeignKey
ALTER TABLE "PronCmuDict" ADD CONSTRAINT "PronCmuDict_orthoWordId_fkey" FOREIGN KEY ("orthoWordId") REFERENCES "OrthoWord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
