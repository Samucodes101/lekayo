-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "email" TEXT,
ADD COLUMN "customerName" TEXT,
ADD COLUMN "customerPhone" TEXT;

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "userId" DROP NOT NULL;
