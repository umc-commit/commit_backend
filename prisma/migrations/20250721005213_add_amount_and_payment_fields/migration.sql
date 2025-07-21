/*
  Warnings:

  - You are about to drop the column `transaction_id` on the `payments` table. All the data in the column will be lost.
  - Added the required column `imp_uid` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `merchant_uid` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pg_provider` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `point_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payments` DROP COLUMN `transaction_id`,
    ADD COLUMN `imp_uid` VARCHAR(100) NOT NULL,
    ADD COLUMN `merchant_uid` VARCHAR(100) NOT NULL,
    ADD COLUMN `pg_provider` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `point_transactions` ADD COLUMN `amount` INTEGER NOT NULL;
