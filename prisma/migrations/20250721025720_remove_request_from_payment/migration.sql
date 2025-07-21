/*
  Warnings:

  - You are about to drop the column `request_id` on the `payments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_request_id_fkey`;

-- DropForeignKey
ALTER TABLE `point_transactions` DROP FOREIGN KEY `point_transactions_payment_id_fkey`;

-- DropIndex
DROP INDEX `payments_request_id_fkey` ON `payments`;

-- DropIndex
DROP INDEX `point_transactions_payment_id_fkey` ON `point_transactions`;

-- AlterTable
ALTER TABLE `payments` DROP COLUMN `request_id`;

-- AlterTable
ALTER TABLE `point_transactions` ADD COLUMN `request_id` BIGINT NULL,
    MODIFY `payment_id` BIGINT NULL;

-- AddForeignKey
ALTER TABLE `point_transactions` ADD CONSTRAINT `point_transactions_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `point_transactions` ADD CONSTRAINT `point_transactions_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
