-- AlterTable
ALTER TABLE "office_locations" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "radius" INTEGER NOT NULL DEFAULT 500;
