/*
  Warnings:

  - You are about to drop the column `commission_id` on the `chatrooms` table. All the data in the column will be lost.
  - Added the required column `commission_Id` to the `chatrooms` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `chatrooms` DROP FOREIGN KEY `chatrooms_commission_id_fkey`;

-- DropIndex
DROP INDEX `chatrooms_commission_id_fkey` ON `chatrooms`;

-- AlterTable
ALTER TABLE `chatrooms` DROP COLUMN `commission_id`,
    ADD COLUMN `commission_Id` BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE `chatrooms` ADD CONSTRAINT `chatrooms_commission_Id_fkey` FOREIGN KEY (`commission_Id`) REFERENCES `commissions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
