-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isOnSale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originalPrice" DECIMAL(10,2);
