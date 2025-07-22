-- CreateEnum
CREATE TYPE "GalleryCategory" AS ENUM ('DESTINATIONS', 'TOURS', 'CULTURE', 'WILDLIFE', 'LANDSCAPES', 'PEOPLE', 'FOOD', 'ACTIVITIES');

-- CreateTable
CREATE TABLE "gallery_images" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "altText" TEXT NOT NULL,
    "location" TEXT,
    "category" "GalleryCategory" NOT NULL DEFAULT 'DESTINATIONS',
    "tags" TEXT[],
    "photographer" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "uploadedById" TEXT,

    CONSTRAINT "gallery_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
