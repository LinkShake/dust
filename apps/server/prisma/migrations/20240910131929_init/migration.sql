-- CreateEnum
CREATE TYPE "Tag" AS ENUM ('FANTASY', 'CONTEMPORARY_LITERATURE', 'ROMANCE', 'DETECTIVE_BOOKS', 'THRILLER', 'HORROR', 'TRUE_STORY', 'PERSONAL_GROUTH', 'HISTORICAL');

-- CreateEnum
CREATE TYPE "Edition" AS ENUM ('HARDBACK', 'PAPERBACK');

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "githubId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Stats" (
    "readBooks" INTEGER NOT NULL DEFAULT 0,
    "notReadBooks" INTEGER NOT NULL DEFAULT 0,
    "readPages" INTEGER NOT NULL DEFAULT 0,
    "totalPages" INTEGER NOT NULL DEFAULT 0,
    "ownedLibraries" INTEGER NOT NULL DEFAULT 0,
    "sharedLibraries" INTEGER NOT NULL DEFAULT 0,
    "statsUserId" TEXT NOT NULL,

    CONSTRAINT "Stats_pkey" PRIMARY KEY ("statsUserId")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" TEXT NOT NULL,
    "tag" "Tag" NOT NULL,
    "booksNum" INTEGER NOT NULL,
    "userStatsUserId" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishList" (
    "wishListUserId" TEXT NOT NULL,

    CONSTRAINT "WishList_pkey" PRIMARY KEY ("wishListUserId")
);

-- CreateTable
CREATE TABLE "Library" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "sharesId" TEXT[],
    "shared" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "userLibraryUserId" TEXT,

    CONSTRAINT "Library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT '',
    "publisher" TEXT NOT NULL DEFAULT '',
    "pages" INTEGER,
    "ISBN" BIGINT,
    "description" TEXT NOT NULL DEFAULT '',
    "tags" "Tag"[] DEFAULT ARRAY[]::"Tag"[],
    "row" INTEGER,
    "lang" TEXT NOT NULL DEFAULT '',
    "edition" "Edition"[] DEFAULT ARRAY[]::"Edition"[],
    "price" DOUBLE PRECISION,
    "buyLink" TEXT,
    "gifted" BOOLEAN DEFAULT false,
    "libraryId" TEXT,
    "wishListId" TEXT,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadCheck" (
    "read" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "PersonalScore" (
    "rating" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "shelf" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryPosition" (
    "id" SERIAL NOT NULL,
    "libraryName" TEXT NOT NULL,
    "libraryNumber" INTEGER NOT NULL,
    "positionId" INTEGER NOT NULL,

    CONSTRAINT "LibraryPosition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stats_statsUserId_key" ON "Stats"("statsUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_userStatsUserId_tag_key" ON "Genre"("userStatsUserId", "tag");

-- CreateIndex
CREATE UNIQUE INDEX "WishList_wishListUserId_key" ON "WishList"("wishListUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Library_userLibraryUserId_name_key" ON "Library"("userLibraryUserId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ReadCheck_userId_bookId_key" ON "ReadCheck"("userId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalScore_userId_bookId_key" ON "PersonalScore"("userId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "Position_bookId_key" ON "Position"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryPosition_positionId_key" ON "LibraryPosition"("positionId");

-- AddForeignKey
ALTER TABLE "Stats" ADD CONSTRAINT "Stats_statsUserId_fkey" FOREIGN KEY ("statsUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Genre" ADD CONSTRAINT "Genre_userStatsUserId_fkey" FOREIGN KEY ("userStatsUserId") REFERENCES "Stats"("statsUserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishList" ADD CONSTRAINT "WishList_wishListUserId_fkey" FOREIGN KEY ("wishListUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Library" ADD CONSTRAINT "Library_userLibraryUserId_fkey" FOREIGN KEY ("userLibraryUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_wishListId_fkey" FOREIGN KEY ("wishListId") REFERENCES "WishList"("wishListUserId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadCheck" ADD CONSTRAINT "ReadCheck_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalScore" ADD CONSTRAINT "PersonalScore_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryPosition" ADD CONSTRAINT "LibraryPosition_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
