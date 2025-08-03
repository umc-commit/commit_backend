/*
  Warnings:

  - You are about to drop the column `user_id` on the `user_agreement` table. All the data in the column will be lost.
  - The primary key for the `user_categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `user_categories` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[account_id,agreement_id]` on the table `user_agreement` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `account_id` to the `user_agreement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_id` to the `user_categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `user_agreement` DROP FOREIGN KEY `user_agreement_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_categories` DROP FOREIGN KEY `user_categories_user_id_fkey`;

-- DropIndex
DROP INDEX `user_agreement_user_id_agreement_id_key` ON `user_agreement`;

-- AlterTable
ALTER TABLE `user_agreement` DROP COLUMN `user_id`,
    ADD COLUMN `account_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `user_categories` DROP PRIMARY KEY,
    DROP COLUMN `user_id`,
    ADD COLUMN `account_id` BIGINT NOT NULL,
    ADD PRIMARY KEY (`account_id`, `category_id`);

-- CreateIndex
CREATE UNIQUE INDEX `user_agreement_account_id_agreement_id_key` ON `user_agreement`(`account_id`, `agreement_id`);

-- AddForeignKey
ALTER TABLE `user_categories` ADD CONSTRAINT `user_categories_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_agreement` ADD CONSTRAINT `user_agreement_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
