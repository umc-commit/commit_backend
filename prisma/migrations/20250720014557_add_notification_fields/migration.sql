/*
  Warnings:

  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `notification_user_id_fkey`;

-- DropTable
DROP TABLE `notification`;

-- CreateTable
CREATE TABLE `notifications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `content` VARCHAR(1000) NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `read_at` DATETIME(3) NULL,
    `type` VARCHAR(50) NOT NULL,
    `related_data` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
