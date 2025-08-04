/*
  Warnings:

  - A unique constraint covering the columns `[type,threshold]` on the table `badges` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `threshold` to the `badges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `badges` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `badges` ADD COLUMN `badge_image` VARCHAR(255) NULL,
    ADD COLUMN `threshold` INTEGER NOT NULL,
    ADD COLUMN `type` VARCHAR(100) NOT NULL;

-- CreateTable
CREATE TABLE `user_badges` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `account_id` BIGINT NOT NULL,
    `badge_id` BIGINT NOT NULL,
    `earned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_badges_account_id_badge_id_key`(`account_id`, `badge_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `badges_type_threshold_key` ON `badges`(`type`, `threshold`);

-- AddForeignKey
ALTER TABLE `user_badges` ADD CONSTRAINT `user_badges_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_badges` ADD CONSTRAINT `user_badges_badge_id_fkey` FOREIGN KEY (`badge_id`) REFERENCES `badges`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
