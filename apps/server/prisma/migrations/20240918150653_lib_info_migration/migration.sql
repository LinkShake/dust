/*
  Warnings:

  - The primary key for the `Genre` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Genre` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[infoId]` on the table `Library` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `infoId` to the `Library` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Genre" DROP CONSTRAINT "Genre_pkey",
DROP COLUMN "id";

-- AlterTable
ALTER TABLE "Library" ADD COLUMN     "infoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "libraryInfoId" TEXT;

-- CreateTable
CREATE TABLE "LibraryInfo" (
    "id" TEXT NOT NULL,
    "prevelantTags" "Tag"[] DEFAULT ARRAY[]::"Tag"[],
    "italianBooks" INTEGER NOT NULL DEFAULT 0,
    "englishBooks" INTEGER NOT NULL DEFAULT 0,
    "prevelantEdition" "Edition" NOT NULL,

    CONSTRAINT "LibraryInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Library_infoId_key" ON "Library"("infoId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_libraryInfoId_fkey" FOREIGN KEY ("libraryInfoId") REFERENCES "LibraryInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Library" ADD CONSTRAINT "Library_infoId_fkey" FOREIGN KEY ("infoId") REFERENCES "LibraryInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
