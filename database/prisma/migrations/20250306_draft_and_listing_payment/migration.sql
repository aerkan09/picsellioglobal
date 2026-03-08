-- AlterTable: new listings are created as DRAFT; existing rows keep current status
ALTER TABLE "Product" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable: optional productId for "pay to publish this listing" flow
ALTER TABLE "PendingShopierOrder" ADD COLUMN IF NOT EXISTS "productId" TEXT;
