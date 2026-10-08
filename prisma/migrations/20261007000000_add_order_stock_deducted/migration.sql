-- AlterTable
ALTER TABLE "Order" ADD COLUMN "stockDeducted" BOOLEAN NOT NULL DEFAULT false;

-- Orders created before this migration had stock deducted at checkout.
-- Cancelled ones were either restocked by the stale-order sweep or never
-- restocked by an admin cancel; neither should be restocked again.
UPDATE "Order" SET "stockDeducted" = true WHERE "status" <> 'CANCELLED';
