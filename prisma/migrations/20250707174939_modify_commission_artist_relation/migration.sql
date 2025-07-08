-- DropForeignKey
ALTER TABLE `commissions` DROP FOREIGN KEY `commissions_artist_id_fkey`;

-- DropIndex
DROP INDEX `commissions_artist_id_fkey` ON `commissions`;

-- AddForeignKey
ALTER TABLE `commissions` ADD CONSTRAINT `commissions_artist_id_fkey` FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
