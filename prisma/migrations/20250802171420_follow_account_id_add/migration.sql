/*
  Warnings:

  - You are about to drop the column `user_id` on the `follows` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[account_id,artist_id]` on the table `follows` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `account_id` to the `follows` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `follows` DROP FOREIGN KEY `follows_user_id_fkey`;

-- DropIndex
DROP INDEX `follows_user_id_artist_id_key` ON `follows`;

-- AlterTable
ALTER TABLE `follows` DROP COLUMN `user_id`,
    ADD COLUMN `account_id` BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `follows_account_id_artist_id_key` ON `follows`(`account_id`, `artist_id`);

-- AddForeignKey
ALTER TABLE `follows` ADD CONSTRAINT `follows_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
