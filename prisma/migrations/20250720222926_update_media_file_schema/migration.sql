/*
  Warnings:

  - You are about to drop the column `createdBy` on the `media_files` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `media_files` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `media_files` table. All the data in the column will be lost.
  - Added the required column `contentType` to the `media_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folder` to the `media_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `media_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `media_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `media_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `media_files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "media_files" DROP COLUMN "createdBy",
DROP COLUMN "fileSize",
DROP COLUMN "mimeType",
ADD COLUMN     "contentType" TEXT NOT NULL,
ADD COLUMN     "folder" TEXT NOT NULL,
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;
