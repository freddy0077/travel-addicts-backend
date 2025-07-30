-- CreateTable
CREATE TABLE "CustomBooking" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "destination" TEXT NOT NULL,
    "travelDates" TEXT NOT NULL,
    "travelers" INTEGER NOT NULL,
    "budget" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomBooking_pkey" PRIMARY KEY ("id")
);
