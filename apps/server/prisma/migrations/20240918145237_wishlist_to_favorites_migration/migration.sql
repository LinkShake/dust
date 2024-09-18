/*
  Warnings:

  - You are about to drop the column `wishListId` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the `WishList` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_wishListId_fkey";

-- DropForeignKey
ALTER TABLE "WishList" DROP CONSTRAINT "WishList_wishListUserId_fkey";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "wishListId",
ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "WishList";

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
