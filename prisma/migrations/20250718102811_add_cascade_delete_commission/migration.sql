-- DropForeignKey
ALTER TABLE `bookmarks` DROP FOREIGN KEY `bookmarks_commission_id_fkey`;

-- DropForeignKey
ALTER TABLE `commission_tags` DROP FOREIGN KEY `commission_tags_tag_id_fkey`;

-- DropIndex
DROP INDEX `bookmarks_commission_id_fkey` ON `bookmarks`;

-- DropIndex
DROP INDEX `commission_tags_tag_id_fkey` ON `commission_tags`;

-- AddForeignKey
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_commission_id_fkey` FOREIGN KEY (`commission_id`) REFERENCES `commissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_tags` ADD CONSTRAINT `commission_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
